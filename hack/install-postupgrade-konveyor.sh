NAMESPACE="${NAMESPACE:-konveyor-tackle}"
TEMPLATE_DIR="${TEMPLATE_DIR:-hack/templates}"
KONVEYOR_UPGRADE_INDEX="${KONVEYOR_UPGRADE_INDEX:-quay.io/migqe/tackle2-operator-upgrade-index:latest}"
SUBSCRIPTION_CHANNEL="${SUBSCRIPTION_CHANNEL:-development}"
PREUPGRADE_VERSION="${PREUPGRADE_VERSION:-0.6.0}"
POSTUPGRADE_VERSION="${POSTUPGRADE_VERSION:-99.0.0}"  #Always the latest from main.
TIMEOUT=300  # Maximum wait time in seconds (5 minutes)
INTERVAL=10  # Time to wait between checks (10 seconds)
ELAPSED=0


echo "Patch subscription channel to ${SUBSCRIPTION_CHANNEL}"
kubectl patch sub konveyor-operator -n konveyor-tackle --type=merge -p "{\"spec\":{\"channel\":\"${SUBSCRIPTION_CHANNEL}\"}}"

echo "Patching installplan for konveyor..."

kubectl patch installplan $(kubectl get installplan -n "${NAMESPACE}" | egrep "$POSTUPGRADE_VERSION"|awk '{print $1}') -n "${NAMESPACE}" --type merge --patch '{"spec":{"approved":true}}'

kubectl wait --namespace "${NAMESPACE}" --for=condition=Successful --timeout=600s tackles.tackle.konveyor.io/tackle

kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=tackle-ui -n "${NAMESPACE}" --timeout=300s

echo "Waiting for UI pod to be replaced after upgrade..."
echo "Previous UI Pod: $PREUPGRADE_UI_POD"

while true; do
  # Get the current UI pod name
  UI_POD_AFTER=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=tackle-ui -o name)
  
  # Check if the pod has changed
  if [[ "$PREUPGRADE_UI_POD" != "$UI_POD_AFTER" ]]; then
    echo "UI pod has changed! New pod: $UI_POD_AFTER"
    break
  fi

  # Check if timeout is reached
  if [[ "$ELAPSED" -ge "$TIMEOUT" ]]; then
    echo "Timeout reached! Pod did not change within $TIMEOUT seconds."
    exit 1  # Fail the script if pod did not bounce
  fi

  echo "Pod has not changed yet. Retrying in $INTERVAL seconds..."
  sleep $INTERVAL
  ((ELAPSED+=INTERVAL))
done
sleep 200s

kubectl get po -n "${NAMESPACE}"
