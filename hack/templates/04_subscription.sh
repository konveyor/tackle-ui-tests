cat <<EOF | kubectl apply -f -
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: konveyor-operator
  namespace: "${NAMESPACE}"
spec:
  channel: "${SUBSCRIPTION_CHANNEL}"
  installPlanApproval: "Manual"
  name: konveyor-operator
  source: konveyor-tackle
  sourceNamespace: konveyor-tackle
EOF