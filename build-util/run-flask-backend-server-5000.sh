#!/bin/sh

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# repoFolder is owf-app-infomapper-builder-ng/.
repoFolder=$(dirname "${scriptFolder}")

cd "${repoFolder}"/server || exit

py -m flask --app=main run