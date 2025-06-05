cat << EOF | kubectl create -f -
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: konveyor-tackle
  namespace: "${NAMESPACE}"
spec:
  displayName: Konveyor Operator
  publisher: Konveyor
  sourceType: grpc
  image: "${KONVEYOR_UPGRADE_INDEX}"
  updateStrategy:
    registryPoll:
      interval: 10m
EOF