# Epic epic

## Process for building esp32 binaries 
- Run `git pull --recurse-submodules` to pull the esp-idf repo 
- (Optional) Run `pyi-makespec .esp-idf/components/partition_table/parttool.py` and replace the name of the python file
    - Create a merged file that merges all the commands into collect like seen in `merged.spec`, see `https://www.zacoding.com/en/post/pyinstaller-create-multiple-executables/` or https://pyinstaller.org/en/stable/spec-files.html#multipackage-bundles
    
- Run `pyinstaller --distpath ./dist merged.spec`
- Drag in the esptool binary from `https://github.com/espressif/esptool` for your platform into the dist folder