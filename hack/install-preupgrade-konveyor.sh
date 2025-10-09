NAMESPACE="${NAMESPACE:-konveyor-tackle}"
TEMPLATE_DIR="${TEMPLATE_DIR:-hack/templates}"
KONVEYOR_UPGRADE_INDEX="${KONVEYOR_UPGRADE_INDEX:-quay.io/migqe/tackle2-operator-upgrade-index:latest}"
SUBSCRIPTION_CHANNEL="${SUBSCRIPTION_CHANNEL:-konveyor-0.6}"
PREUPGRADE_VERSION="${PREUPGRADE_VERSION:-0.6.0}"
POSTUPGRADE_VERSION="${POSTUPGRADE_VERSION:-99.0.0}"  #Always the latest from main.
echo "Creating namespace"
echo "${SUBSCRIPTION_CHANNEL}"
source "${TEMPLATE_DIR}/01_namespace.sh"

source "${TEMPLATE_DIR}/02_catsrc.sh"

source "${TEMPLATE_DIR}/03_operatorgroup.sh"

source "${TEMPLATE_DIR}/04_subscription.sh"

kubectl get sub -n konveyor-tackle -o yaml #Remove later

sleep 60s
echo "Patching installplan for konveyor..."

kubectl get installplan -n "${NAMESPACE}"

kubectl patch installplan $(kubectl get installplan -n "${NAMESPACE}" | egrep "$PREUPGRADE_VERSION"|awk '{print $1}') -n "${NAMESPACE}" --type merge --patch '{"spec":{"approved":true}}'

sleep 20s

source "${TEMPLATE_DIR}/05_tacklecr.sh"

kubectl wait --namespace "${NAMESPACE}" --for=condition=Successful --timeout=600s tackles.tackle.konveyor.io/tackle
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=tackle-ui -n "${NAMESPACE}" --timeout=300s
PREUPGRADE_UI_POD=$(kubectl get pod -l app.kubernetes.io/name=tackle-ui -n "${NAMESPACE}" -o name)
echo "PREUPGRADE_UI_POD=$PREUPGRADE_UI_POD" >> $GITHUB_ENV
sleep 120s

kubectl get po -n "${NAMESPACE}"
