# ORT / Attributions File Setup and Usage Instructions

## Installation

1. Install Java SDK 11 or above.
2. Install the ORT package:

```bash
export JAVA_OPTS="$JAVA_OPTS -Xmx8g"
git clone https://github.com/oss-review-toolkit/ort
cd ort
git submodule update --init --recursive
./gradlew installDist
```
3. Configure GLIDE's root directory path:
```bash
export GLIDE_ROOT_PATH="/path/to/glide-for-redis" # e.g. /home/ubuntu/glide-for-redis
```
4. Create ort_results folder for each language
```bash
mkdir ${GLIDE_ROOT_PATH}/python/ort_results
mkdir ${GLIDE_ROOT_PATH}/glide-core/ort_results
mkdir ${GLIDE_ROOT_PATH}/node/ort_results
```

## Node

1. Build GLIDE's Node package (`cd node && npm i && npm run build`).
2. Remove the `glide-rs` dependency from `node/package.json`.
3. Change the `${package_version}` in `node/package.json`.
4. In `node/npm/glide/package.json`, update `${scope}` to `@aws/`, `${pkg_name}` to `glide-for-redis-base`, and `${package_version}` accordingly.
5. Create a `config.yml` file and enable `allowDynamicVersions`:

```bash
mkdir ~/.ort/config
vi ~/.ort/config/config.yml
```

```yaml
# config.yml
ort:
  analyzer:
    allowDynamicVersions: true
```

### To analyze and report for licenses, execute the following tools from within the ort directory:

**Analyzer (analyzer-result.json)**
```bash
./gradlew cli:run --args="analyze -i ${GLIDE_ROOT_PATH}/node -o ${GLIDE_ROOT_PATH}/node/ort_results -f JSON"
```

**NOTICE SUMMARY**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/node/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/node/ort_results/ -f PlainTextTemplate -O PlainTextTemplate=template.id=NOTICE_SUMMARY"
```

**NOTICE DEFAULT**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/node/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/node/ort_results/ -f PlainTextTemplate"
```

## Python

1. Build the wrapper (see instructions in `python/DEVELOPER.md`).
2. Install `python-inspector`:

```bash
pip install git+https://github.com/nexB/python-inspector
```

### To analyze and report for licenses, execute the following tools from within the ort directory:

**Analyzer (analyzer-result.json)**
```bash
./gradlew cli:run --args="analyze -i ${GLIDE_ROOT_PATH}/python -o ${GLIDE_ROOT_PATH}/python/ort_results -f JSON"
```

**NOTICE SUMMARY**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/python/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/python/ort_results/ -f PlainTextTemplate -O PlainTextTemplate=template.id=NOTICE_SUMMARY"
```

**NOTICE DEFAULT**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/python/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/python/ort_results/ -f PlainTextTemplate"
```

## Rust

1. Build the core (`cargo build --all-features`).
### To analyze and report for licenses, execute the following tools from within the ort directory:

**Analyzer (analyzer-result.json)**
```bash
./gradlew cli:run --args="analyze -i ${GLIDE_ROOT_PATH}/glide-core -o ${GLIDE_ROOT_PATH}/glide-core/ort_results -f JSON"
```

**NOTICE SUMMARY**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/glide-core/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/glide-core/ort_results/ -f PlainTextTemplate -O PlainTextTemplate=template.id=NOTICE_SUMMARY"
```

**NOTICE DEFAULT**
```bash
./gradlew cli:run --args="report -i ${GLIDE_ROOT_PATH}/glide-core/ort_results/analyzer-result.json -o ${GLIDE_ROOT_PATH}/glide-core/ort_results/ -f PlainTextTemplate"
```

## Check the Licenses

Verify that all dependencies' licenses are approved. Execute this only after running the analyzer and generating the NOTICE_DEFAULT reports for each language.

1. Run the script to find all used licenses:

```bash
# run from glide-for-redis/
python3 utils/ort/parse_ort_report.py
```

2. Review the found licenses against the pre-approved licenses list [here](#appendix-a-license-list-pre-approved-for-distribution).
3. Cut a new issue for the attribution files if there is a license not found on the list.
- Approved packages & versions with MPL 2.0:
    - Package ID: `certifi:2023.11.17`
    - Package ID: `pathspec:0.12.1`

## Create Attribution Files

1. Rename and move all generated `NOTICE_DEFAULT` files for each language:

```bash
cd $GLIDE_ROOT_PATH
mv python/ort_results/NOTICE_DEFAULT python/THIRD_PARTY_LICENSES_PYTHON
mv node/ort_results/NOTICE_DEFAULT node/THIRD_PARTY_LICENSES_NODE
mv glide-core/ort_results/NOTICE_DEFAULT glide-core/THIRD_PARTY_LICENSES_RUST
git add python/THIRD_PARTY_LICENSES_PYTHON node/THIRD_PARTY_LICENSES_NODE glide-core/THIRD_PARTY_LICENSES_RUST
git commit -m "Updated attribution files"
```
2. Open a pull request for the updated attribution files

## Troubleshooting

1. If the analyzer returns an error, for example:

```bash
Unresolved issues: 1 error, 0 warnings, 0 hints.
There is 1 unresolved issue with a severity equal to or greater than the WARNING threshold.
```

   Search in the `analyzer-result.json` report for "issues" to get more information about the error.

## Appendices

### Appendix A: License List (Pre-approved for Distribution)

The following licenses are pre-approved for distribution without modification:

- BSD Zero Clause License [0BSD]
- Apache License 1.1 [Apache-1.1]
- Apache License 2.0 [Apache-2.0]
- BSD 1-Clause License [BSD-1-Clause]
- BSD 2-Clause "Simplified" License [BSD-2-Clause]
- BSD 2-Clause FreeBSD License [BSD-2-Clause-FreeBSD]
- BSD 3-Clause "New" or "Revised" License [BSD-3-Clause]
- BSD with Attribution [BSD-3-Clause-Attribution]
- BSD Source Code Attribution [BSD-Source-Code]
- Boost Software License 1.0 [BSL-1.0]
- Creative Commons Zero v1.0 Universal [CC0-1.0]
- Historical Permission Notice and Disclaimer [HPND]
- Independent JPEG Group License [IJG]
- ISC License [ISC]
- JSON License [JSON]
- libpng License [Libpng]
- MIT License [MIT]
- MIT No Attribution [MIT-0]
- NTP License [NTP]
- SIL Open Font License 1.1 [OFL-1.1]
- Open LDAP Public License v2.8 [OLDAP-2.8]
- OpenSSL License [OpenSSL]
- Open Data Commons Public Domain Dedication & License 1.0 [PDDL-1.0]
- PostgreSQL License [PostgreSQL]
- Python Software Foundation License 2.0 [PSF-2.0]
- Python License 2.0 [Python-2.0]
- Unicode License Agreement - Data Files and Software (2015) [Unicode-DFS-2015]
- Unicode License Agreement - Data Files and Software (2016) [Unicode-DFS-2016]
- The Unlicense [Unlicense]
- Do What The F*ck You Want To Public License [WTFPL]
- X11 License [X11]
- zlib License [Zlib]
- SQLite Blessing [blessing]
- bzip2 and libbzip2 License v1.0.6 [bzip2-1.0.6]
- curl License [curl]
- zlib/libpng License with Acknowledgement [zlib-acknowledgement]
