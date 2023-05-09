/*
 * Sample program for ESP32 acting as a Bluetooth keyboard
 *
 * Copyright (c) 2019 Manuel Bl
 *
 * Licensed under MIT License
 * https://opensource.org/licenses/MIT
 */

//
// This program lets an ESP32 act as a keyboard connected via Bluetooth.
// When a button attached to the ESP32 is pressed, it will generate the key strokes for a message.
//
// For the setup, a momentary button should be connected to pin 2 and to ground.
// Pin 2 will be configured as an input with pull-up.
//
// In order to receive the message, add the ESP32 as a Bluetooth keyboard of your computer
// or mobile phone:
//
// 1. Go to your computers/phones settings
// 2. Ensure Bluetooth is turned on
// 3. Scan for Bluetooth devices
// 4. Connect to the device called "ESP32 Keyboard"
// 5. Open an empty document in a text editor
// 6. Press the button attached to the ESP32

#define US_KEYBOARD 1

#include <Arduino.h>
#include <MFRC522.h>
#include "BLEDevice.h"
#include "BLEHIDDevice.h"
#include "HIDTypes.h"
#include "HIDKeyboardTypes.h"
#include <Preferences.h>

// Change the below values if desired
#define BUTTON_PIN 2
#define MESSAGE "Hello from ESP32\n"
#define DEVICE_NAME "ESP32 Keyboard"

// Forward declarations
void bluetoothTask(void *);
void typeText(const char *text);
void print_byte_array(byte *byte_arr, size_t arr_size);
void enterPass(const char *text);

bool isBleConnected = false;

#define RST_PIN 9 // Configurable, see typical pin layout above
#define SS_PIN 5  // Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance
Preferences preferences;
#define MAX_UID_BYTES 20
#define UID_BYTE_ARRAY_SIZE 4 * MAX_UID_BYTES

byte uid_cache[UID_BYTE_ARRAY_SIZE];
unsigned int uid_count;

void setup()
{
    Serial.begin(115200);

    // Connect to RFID readter
    Serial.println("Testing out connecting to SPI ");
    SPI.begin(); // Init SPI bus
    Serial.println("Testing out connecting to mfrc");
    mfrc522.PCD_Init(); // Init MFRC522
    delay(4);           // Optional delay. Some board do need more time after init to be ready, see Readme
    Serial.print("Details of card reader:");
    mfrc522.PCD_DumpVersionToSerial(); // Show details of PCD - MFRC522 Card Reader details

    // Readonly prefs
    preferences.begin("kb", true);

    uid_count = preferences.getUInt("num_cards", 0);
    size_t uid_buffer_length = preferences.getBytesLength("uids");

    preferences.getBytes("uids", uid_cache, uid_buffer_length);
    Serial.println("Buffer Length " + String(uid_buffer_length) + "Num cards" + String(uid_count));
    print_byte_array(uid_cache, uid_buffer_length);

    // start Bluetooth task
    xTaskCreate(bluetoothTask, "bluetooth", 20000, NULL, 5, NULL);
}

void loop()
{
    if (!isBleConnected)
        return;

    // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
    if (!mfrc522.PICC_IsNewCardPresent())
    {
        return;
    }

    // Select one of the cards
    if (!mfrc522.PICC_ReadCardSerial())
    {
        return;
    }

    MFRC522::Uid *uid = &mfrc522.uid; // mfrc522.PICC_DumpDetailsToSerial
    print_byte_array(uid->uidByte, uid->size);

    int selectedId = -1;
    for (int k = 0; k < uid_count; k++)
    {
        int index = 4 * k;
        byte *start_of_tag = &uid_cache[index];
        selectedId = k;
        for (byte i = 0; i < mfrc522.uid.size; i++)
        {
            if (mfrc522.uid.uidByte[i] != start_of_tag[i])
            {
                selectedId = -1;
                break;
            }
        }

        if (selectedId != -1)
        {
            break;
        }
    }
    if (selectedId == -1)
        return;
    mfrc522.PICC_HaltA(); // stop tag so we don't get repeats
    digitalWrite(2, HIGH);
    // char selectedIdChars[10];
    // itoa(selectedId, selectedIdChars, 9);
    // auto pswdKey = "name" + String(selectedId);
    auto pswdKey = "pass" + String(selectedId);
    Serial.println("Epic found, trying " + pswdKey);

    auto pswd = preferences.getString(pswdKey.c_str());
    // Serial.println("Sending password " + pswd);

    enterPass(pswd.c_str());
    // typeText(pswd.c_str());
    delay(1000);
}

// Message (report) sent when a key is pressed or released
struct InputReport
{
    uint8_t modifiers;      // bitmask: CTRL = 1, SHIFT = 2, ALT = 4
    uint8_t reserved;       // must be 0
    uint8_t pressedKeys[6]; // up to six concurrenlty pressed keys
};

// Message (report) received when an LED's state changed
struct OutputReport
{
    uint8_t leds; // bitmask: num lock = 1, caps lock = 2, scroll lock = 4, compose = 8, kana = 16
};

// The report map describes the HID device (a keyboard in this case) and
// the messages (reports in HID terms) sent and received.
static const uint8_t REPORT_MAP[] = {
    USAGE_PAGE(1), 0x01,      // Generic Desktop Controls
    USAGE(1), 0x06,           // Keyboard
    COLLECTION(1), 0x01,      // Application
    REPORT_ID(1), 0x01,       //   Report ID (1)
    USAGE_PAGE(1), 0x07,      //   Keyboard/Keypad
    USAGE_MINIMUM(1), 0xE0,   //   Keyboard Left Control
    USAGE_MAXIMUM(1), 0xE7,   //   Keyboard Right Control
    LOGICAL_MINIMUM(1), 0x00, //   Each bit is either 0 or 1
    LOGICAL_MAXIMUM(1), 0x01,
    REPORT_COUNT(1), 0x08, //   8 bits for the modifier keys
    REPORT_SIZE(1), 0x01,
    HIDINPUT(1), 0x02,     //   Data, Var, Abs
    REPORT_COUNT(1), 0x01, //   1 byte (unused)
    REPORT_SIZE(1), 0x08,
    HIDINPUT(1), 0x01,     //   Const, Array, Abs
    REPORT_COUNT(1), 0x06, //   6 bytes (for up to 6 concurrently pressed keys)
    REPORT_SIZE(1), 0x08,
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x65, //   101 keys
    USAGE_MINIMUM(1), 0x00,
    USAGE_MAXIMUM(1), 0x65,
    HIDINPUT(1), 0x00,     //   Data, Array, Abs
    REPORT_COUNT(1), 0x05, //   5 bits (Num lock, Caps lock, Scroll lock, Compose, Kana)
    REPORT_SIZE(1), 0x01,
    USAGE_PAGE(1), 0x08,    //   LEDs
    USAGE_MINIMUM(1), 0x01, //   Num Lock
    USAGE_MAXIMUM(1), 0x05, //   Kana
    LOGICAL_MINIMUM(1), 0x00,
    LOGICAL_MAXIMUM(1), 0x01,
    HIDOUTPUT(1), 0x02,    //   Data, Var, Abs
    REPORT_COUNT(1), 0x01, //   3 bits (Padding)
    REPORT_SIZE(1), 0x03,
    HIDOUTPUT(1), 0x01, //   Const, Array, Abs
    END_COLLECTION(0)   // End application collection
};

BLEHIDDevice *hid;
BLECharacteristic *input;
BLECharacteristic *output;

const InputReport NO_KEY_PRESSED = {};

/*
 * Callbacks related to BLE connection
 */
class BleKeyboardCallbacks : public BLEServerCallbacks
{

    void onConnect(BLEServer *server)
    {
        isBleConnected = true;

        // Allow notifications for characteristics
        BLE2902 *cccDesc = (BLE2902 *)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
        cccDesc->setNotifications(true);

        Serial.println("Client has connected");
    }

    void onDisconnect(BLEServer *server)
    {
        isBleConnected = false;

        // Disallow notifications for characteristics
        BLE2902 *cccDesc = (BLE2902 *)input->getDescriptorByUUID(BLEUUID((uint16_t)0x2902));
        cccDesc->setNotifications(false);

        Serial.println("Client has disconnected");
    }
};

/*
 * Called when the client (computer, smart phone) wants to turn on or off
 * the LEDs in the keyboard.
 *
 * bit 0 - NUM LOCK
 * bit 1 - CAPS LOCK
 * bit 2 - SCROLL LOCK
 */
class OutputCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *characteristic)
    {
        OutputReport *report = (OutputReport *)characteristic->getData();
        Serial.print("LED state: ");
        Serial.print((int)report->leds);
        Serial.println();
    }
};

void bluetoothTask(void *)
{

    // initialize the device
    BLEDevice::init(DEVICE_NAME);
    BLEServer *server = BLEDevice::createServer();
    server->setCallbacks(new BleKeyboardCallbacks());

    // create an HID device
    hid = new BLEHIDDevice(server);
    input = hid->inputReport(1);   // report ID
    output = hid->outputReport(1); // report ID
    output->setCallbacks(new OutputCallbacks());

    // set manufacturer name
    hid->manufacturer()->setValue("Maker Community");
    // set USB vendor and product ID
    hid->pnp(0x02, 0xe502, 0xa111, 0x0210);
    // information about HID device: device is not localized, device can be connected
    hid->hidInfo(0x00, 0x02);

    // Security: device requires bonding
    BLESecurity *security = new BLESecurity();
    security->setAuthenticationMode(ESP_LE_AUTH_BOND);

    // set report map
    hid->reportMap((uint8_t *)REPORT_MAP, sizeof(REPORT_MAP));
    hid->startServices();

    // set battery level to 100%
    hid->setBatteryLevel(100);

    // advertise the services
    BLEAdvertising *advertising = server->getAdvertising();
    advertising->setAppearance(HID_KEYBOARD);
    advertising->addServiceUUID(hid->hidService()->getUUID());
    advertising->addServiceUUID(hid->deviceInfo()->getUUID());
    advertising->addServiceUUID(hid->batteryService()->getUUID());
    advertising->start();

    Serial.println("BLE ready");
    delay(portMAX_DELAY);
};

void typeText(const char *text)
{
    int len = strlen(text);
    for (int i = 0; i < len; i++)
    {

        // translate character to key combination
        uint8_t val = (uint8_t)text[i];
        if (val > KEYMAP_SIZE)
            continue; // character not available on keyboard - skip
        KEYMAP map = keymap[val];

        // create input report
        InputReport report = {
            .modifiers = map.modifier,
            .reserved = 0,
            .pressedKeys = {
                map.usage,
                0, 0, 0, 0, 0}};

        // send the input report
        input->setValue((uint8_t *)&report, sizeof(report));
        input->notify();

        delay(5);

        // release all keys between two characters; otherwise two identical
        // consecutive characters are treated as just one key press
        input->setValue((uint8_t *)&NO_KEY_PRESSED, sizeof(NO_KEY_PRESSED));
        input->notify();

        delay(5);
    }
}

void print_byte_array(byte *byte_arr, size_t arr_size)
{

    for (size_t i = 0; i < arr_size; i++)
    {
        // After F hex wraps around to 10 so print space and 0 to go to new
        // if (byte_arr[i] < 0x10)
        // 	Serial.print(F(" 0"));
        // else
        // 	Serial.print(F(" "));
        // Each byte is two hex values
        Serial.print(byte_arr[i], HEX);
    }
    Serial.print("\n");
}

#define SPACES_PRESSED 4

void enterPass(const char *text)
{

    uint8_t space_val = 0x2c;

    for (int i = 0; i < SPACES_PRESSED; i++)
    {
        InputReport space = {
            .modifiers = 0,
            .reserved = 0,
            .pressedKeys = {
                space_val,
                0, 0, 0, 0, 0}};

        // send the input report
        input->setValue((uint8_t *)&space, sizeof(space));
        input->notify();

        delay(100);
    }

    delay(1000);

    uint8_t val = 0x04;

    InputReport ctrla = {
        .modifiers = KEY_CTRL,
        .reserved = 0,
        .pressedKeys = {
            val,
            0, 0, 0, 0, 0}};

    // send the input report
    input->setValue((uint8_t *)&ctrla, sizeof(ctrla));
    input->notify();

    delay(50);

    // uint8_t
    unsigned char backSpaceKey = 0x2a;
    InputReport report = {
        .modifiers = 0,
        .reserved = 0,
        .pressedKeys = {
            backSpaceKey,
            0, 0, 0, 0, 0}};

    // send the input report
    input->setValue((uint8_t *)&report, sizeof(report));
    input->notify();

    // release all keys between two characters; otherwise two identical
    // consecutive characters are treated as just one key press
    input->setValue((uint8_t *)&NO_KEY_PRESSED, sizeof(NO_KEY_PRESSED));
    input->notify();

    delay(5);

    typeText(text);

    unsigned char enterKey = 0x28;
    InputReport enterReport = {
        .modifiers = 0,
        .reserved = 0,
        .pressedKeys = {
            enterKey,
            0, 0, 0, 0, 0}};

    // send the input report
    input->setValue((uint8_t *)&enterReport, sizeof(enterReport));
    input->notify();

    delay(5);

    // release all keys between two characters; otherwise two identical
    // consecutive characters are treated as just one key press
    input->setValue((uint8_t *)&NO_KEY_PRESSED, sizeof(NO_KEY_PRESSED));
    input->notify();

    delay(5);
}