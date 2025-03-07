#!/bin/bash

set -E
set -e
set -x
set -o pipefail

SOURCE_UPGRADE_BUNDLE_IMAGE="${OPERATOR_BUNDLE_IMAGE:-quay.io/konveyor/tackle2-operator-bundle:v0.6.0}"
TARGET_UPGRADE_BUNDLE_IMAGE="${OPERATOR_BUNDLE_IMAGE:-quay.io/konveyor/tackle2-operator-bundle:latest}"

echo 'Creating bundle image using $SOURCE_UPGRADE_BUNDLE_IMAGE and $TARGET_UPGRADE_BUNDLE_IMAGE'

opm index add --bundles "${SOURCE_UPGRADE_BUNDLE_IMAGE}","${TARGET_UPGRADE_BUNDLE_IMAGE}" --tag quay.io/migqe/tackle2-operator-upgrade-index:latest

podman images

podman login -u="${QUAY_USERNAME}" -p="${QUAY_PASSWORD}" quay.io
podman push quay.io/migqe/tackle2-operator-upgrade-index:latest
