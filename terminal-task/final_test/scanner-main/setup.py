from setuptools import setup, find_packages
import os

def read_requirements():
    with open('requirements.txt') as req:
        content = req.read()
        requirements = content.split('\n')
    return requirements

def find_whitelisted_files(directory, whitelisted_extensions=[]):
    whitelisted_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(tuple(whitelisted_extensions)):
                whitelisted_files.append(os.path.relpath(os.path.join(root, file), directory))
    return whitelisted_files

setup(
    name='scanner',
    version='0.2',
    packages=find_packages(),
    include_package_data=True,
    install_requires=read_requirements(),
    entry_points={
        'console_scripts': [
            'scanner = scanner.cli:cli',
        ],
    },
    package_data={
        'scanner': find_whitelisted_files('scanner', [
            '.yaml', '.yml', '.xml'
        ]),
    }
)
