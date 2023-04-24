
#include <SPI.h>
#include <MFRC522.h>
#include <Preferences.h>
#include <Base64.h>
#include "Keyboard.h"

#define RST_PIN 9 // Configurable, see typical pin layout above
#define SS_PIN 5	// Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance
Preferences preferences;
#define MAX_UID_BYTES 20
#define UID_BYTE_ARRAY_SIZE 4 * MAX_UID_BYTES

byte uid_cache[UID_BYTE_ARRAY_SIZE];
unsigned int uid_count;

byte tag[10]={0x64,0xAE,0xDD,0xFC,};
char pswd[]="********\n";      //password, end with just \n
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

void setup()
{
	Serial.begin(115200); // Initialize serial communications with the PC

	// Connect to RFID readter
	SPI.begin();											 // Init SPI bus
	mfrc522.PCD_Init();								 // Init MFRC522
	delay(4);													 // Optional delay. Some board do need more time after init to be ready, see Readme
	mfrc522.PCD_DumpVersionToSerial(); // Show details of PCD - MFRC522 Card Reader details

	Keyboard.begin(); // start USB keyboard

	// Readonly prefs
	preferences.begin("kb", true);

	uid_count = preferences.getUInt("num_cards", 0);
	// size_t uid_buffer_length = uid_count * 4;
	size_t uid_buffer_length = preferences.getBytesLength("uids");
	// unsigned char uid_buffer[uid_buffer_length];

	preferences.getBytes("uids", uid_cache, uid_buffer_length);
	Serial.println("Buffer Length " + String(uid_buffer_length) + "Num cards" + String(uid_count));
	print_byte_array(uid_cache, uid_buffer_length);
	auto testString = preferences.getString("test");
	Serial.println(testString);

	pinMode(2, OUTPUT);
}

// int find_card_uid(uint_8 *found_arr)
// {
// 	unsigned int
// }

void loop()
{
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

	// Dump debug info about the card; PICC_HaltA() is automatically called
	// mfrc522.PICC_DumpToSerial(&(mfrc522.uid));

	MFRC522::Uid *uid = &mfrc522.uid; // mfrc522.PICC_DumpDetailsToSerial

	// Compare 4 bytes to see if they match anything in the bufffer
	// if ()
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
	Serial.println("Epic found in index" + String(selectedId));
	mfrc522.PICC_HaltA(); // stop tag so we don't get repeats
	digitalWrite(2, HIGH);
	auto pswd = preferences.getString("name" + String(selectedId));
	Serial.println("Sending password " + pswd);

//  Print is realeased aswell, press is released explicitly with release all
	Keyboard.print(pswd);
	Keyboard.print(KEY_ENTER);
	// Keyboard.releaseAll()

	delay(1000);
}
