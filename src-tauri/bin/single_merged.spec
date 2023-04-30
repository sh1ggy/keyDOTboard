# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Checkout here for better examples
# https://github.com/pyinstaller/pyinstaller/blob/develop/tests/functional/specs/test_multipackage1.spec

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
# The binary output name arguemnt (3) has to be the same as the one provided in exe 
MERGE( (parttool_a, 'parttool', 'parttool-x86_64-pc-windows-msvc'), (nvs_gen_a, 'nvs_partition_gen', 'nvs_gen-x86_64-pc-windows-msvc') )

parttool_z = PYZ(parttool_a.pure, parttool_a.zipped_data, cipher=block_cipher)

parttool_exe = EXE(
    parttool_z,
    parttool_a.scripts,

    parttool_a.binaries,
    parttool_a.zipfiles,
    parttool_a.datas,
    #parttool_a.dependencies,

    [],
    name='parttool-x86_64-pc-windows-msvc',
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

    upx_exclude=[],
    runtime_tmdir=None,
)

nvs_gen_z = PYZ(nvs_gen_a.pure, nvs_gen_a.zipped_data, cipher=block_cipher)

nvs_gen_exe = EXE(
    nvs_gen_z,
    nvs_gen_a.scripts,


    nvs_gen_a.binaries,
    nvs_gen_a.zipfiles,
    nvs_gen_a.datas,
    # This is important to a merged one-file-lib
    nvs_gen_a.dependencies,
    
    [],
    name='nvs_gen-x86_64-pc-windows-msvc',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,

    upx_exclude=[],
    runtime_tmdir=None,
)

