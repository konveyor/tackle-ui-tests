cat << EOF | kubectl create -f -
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: konveyor-tackle
  namespace: "${NAMESPACE}"
spec:
  targetNamespaces:
    - konveyor-tackle
EOF