cat <<EOF | kubectl apply -f -
kind: Tackle
apiVersion: tackle.konveyor.io/v1alpha1
metadata:
  name: tackle
  namespace: "${NAMESPACE}"
spec:
  feature_auth_required: "true"
EOF