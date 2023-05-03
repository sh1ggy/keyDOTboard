# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Checkout here for better examples
# https://github.com/pyinstaller/pyinstaller/blob/develop/tests/functional/specs/test_multipackage1.spec

#TODO: get results from `rustc -Vv` and use host arg for exe name
import subprocess
def get_host_triplet():
    output = subprocess.check_output(["rustc", "-Vv"])
    output_str = output.decode("utf-8")

    # parse the output string to extract the host value
    for line in output_str.split("\n"):
        if "host:" in line:
            return line.split(":")[1].strip()


host_suffix = "-%s" % get_host_triplet()

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


analyze_nvs_a = Analysis(
    ['esp-idf/components/partition_table/analyze_nvs.py'],
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
MERGE( (parttool_a, 'parttool', 'parttool' + host_suffix), (nvs_gen_a, 'nvs_partition_gen', 'nvs_gen' + host_suffix), (analyze_nvs_a, 'analyze_nvs', 'analyze_nvs' + host_suffix))

parttool_z = PYZ(parttool_a.pure, parttool_a.zipped_data, cipher=block_cipher)

parttool_exe = EXE(
    parttool_z,
    parttool_a.scripts,

    parttool_a.binaries,
    parttool_a.zipfiles,
    parttool_a.datas,
    parttool_a.dependencies,

    [],
    name='parttool' + host_suffix,
    debug=False,
    strip=False,
    upx=False,
    console=True,

    #upx_exclude=[],
    #runtime_tmdir=None,
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
    name='nvs_gen' + host_suffix,
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
    #runtime_tmdir=None,
)


analyze_nvs_z = PYZ(parttool_a.pure, parttool_a.zipped_data, cipher=block_cipher)


analyze_nvs_exe = EXE(
    analyze_nvs_z,
    analyze_nvs_a.scripts,

    analyze_nvs_a.binaries,
    analyze_nvs_a.zipfiles,
    analyze_nvs_a.datas,
    analyze_nvs_a.dependencies,

    [],
    name='analyze_nvs' + host_suffix,
    debug=False,
    strip=False,
    upx=False,
    console=True,
)