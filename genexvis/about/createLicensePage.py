import sys
import json

def main(package_json_path):
    json_input = []
    for line in sys.stdin:
        json_input.append(line)
    json_string = "".join(json_input)

    production_depend = []
    depend_json = json.loads(open(package_json_path).read())
    for dependency in depend_json['dependencies'].keys():
        production_depend.append(dependency)

    new_json = {}
    json_parsed = json.loads(json_string)
    for module, values in json_parsed.items():
        if module.rsplit('@', 1)[0] in production_depend:
            new_json[module] = values
            if 'licenseFile' in values and 'license' in values['licenseFile'].lower():
                with open(values['licenseFile']) as license:
                    values['licenseContent'] = license.read()
            if module.startswith('highcharts'):
                values['licenseContent'] = values['licenses']
            del values['path']

    json_string = json.dumps(new_json, sort_keys=True, indent=2)
    print(json_string)


if __name__ == '__main__':
    main(sys.argv[1])
