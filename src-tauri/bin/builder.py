
import subprocess
def get_host_triplet():
    output = subprocess.check_output(["rustc", "-Vv"])
    output_str = output.decode("utf-8")

    # parse the output string to extract the host value
    for line in output_str.split("\n"):
        if "host:" in line:
            return line.split(":")[1].strip()

host_suffix = "-%s" % get_host_triplet()

# print("Host Triplet: %s" % get_host_triplet())
print(host_suffix)