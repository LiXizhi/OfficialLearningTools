"""Stage both Bumi course folders using their public Keepwork CDN names."""
import argparse
from pathlib import Path
from shutil import copyfile
import subprocess


def stage(destination):
    repo = Path(__file__).resolve().parents[2]
    for source, name in [('BumiLessons', 'bumi-lessons'), ('BumiLessons-H5', 'bumi-lessons-h5')]:
        output = destination / name
        output.mkdir(parents=True, exist_ok=False)
        tracked = subprocess.check_output(['git', 'ls-files', '-z', '--', source], cwd=repo)
        for entry in tracked.decode('utf-8').split('\0')[:-1]:
            file = repo / entry
            relative = file.relative_to(repo / source)
            if relative.parts[0] == 'authoring' or file.name == 'README.md':
                continue
            target = output / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            if source == 'BumiLessons' and file.suffix == '.html':
                # Local checkout and CDN use different sibling directory names.
                target.write_bytes(file.read_bytes().replace(b'href="../../BumiLessons-H5/',
                                                             b'href="../../bumi-lessons-h5/'))
            else:
                copyfile(file, target)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    stage(parser.parse_args().destination)
