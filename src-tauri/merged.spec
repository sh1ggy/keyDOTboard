# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


parttool_a = Analysis(
    ['esp-idf/components/partition_table/parttool.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
parttool_z = PYZ(parttool_a.pure, parttool_a.zipped_data, cipher=block_cipher)

parttool_exe = EXE(
    parttool_z,
    parttool_a.scripts,
    [],
    exclude_binaries=True,
    name='parttool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

nvs_gen_a = Analysis(
    ['esp-idf/components/nvs_flash/nvs_partition_generator/nvs_partition_gen.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

nvs_gen_z = PYZ(nvs_gen_a.pure, nvs_gen_a.zipped_data, cipher=block_cipher)

nvs_gen_exe = EXE(
    nvs_gen_z,
    nvs_gen_a.scripts,
    [],
    exclude_binaries=True,
    name='nvs_partition_gen',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)


coll = COLLECT(
    parttool_exe,
    parttool_a.binaries,
    parttool_a.zipfiles,
    parttool_a.datas,

    nvs_gen_exe,
    nvs_gen_a.binaries,
    nvs_gen_a.zipfiles,
    nvs_gen_a.datas,
    
    strip=False,
    upx=True,
    upx_exclude=[],
    name='esp_bins',
)