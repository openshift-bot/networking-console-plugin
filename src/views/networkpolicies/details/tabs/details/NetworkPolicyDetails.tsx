import {
  ResourceLink,
  Timestamp,
  useAccessReview,
  useAnnotationsModal,
  useFlag,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';
import ExternalLink from '@utils/components/ExternalLink/ExternalLink';
import { FLAGS } from '@utils/constants';
import {
  getNetworkPolicyDocURL,
  isManaged,
} from '@utils/constants/documentation';
import { useNetworkingTranslation } from '@utils/hooks/useNetworkingTranslation';
import { NetworkPolicyKind } from '@utils/resources/networkpolicies/types';
import React from 'react';
import { Trans } from 'react-i18next';
import { EgressHeader, IngressHeader } from './Headers';
import { consolidatePeers } from './utils';
import PeerRow from './PeerRow';
import * as _ from 'lodash';
import SectionHeading from '@utils/components/SectionHeading/SectionHeading';
import { Button, PageSection } from '@patternfly/react-core';
import { DetailsItem } from '@utils/components/DetailsItem/DetailsItem';
import { OwnerReferences } from '@utils/components/OwnerReference/owner-references';
import { PencilAltIcon } from '@patternfly/react-icons';
import Loading from '@utils/components/Loading/Loading';
import {
  NetworkPolicyModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { LabelList } from '@utils/components/DetailsItem/LabelList';

type DetailsProps = {
  obj: NetworkPolicyKind;
};

const NetworkPolicyDetails: React.FunctionComponent<DetailsProps> = ({
  obj: networkPolicy,
}) => {
  const hasOpenshiftFlag = useFlag(FLAGS.OPENSHIFT);
  const { t } = useNetworkingTranslation();
  const metadata = networkPolicy?.metadata;
  const annotationsModalLauncher = useAnnotationsModal(networkPolicy);
  const labelsModalLauncher = useLabelsModal(networkPolicy);

  const [canUpdate] = useAccessReview({
    group: NetworkPolicyModel?.apiGroup,
    resource: NetworkPolicyModel?.plural,
    verb: 'patch',
    name: metadata?.name,
    namespace: metadata?.namespace,
  });

  if (!networkPolicy)
    return (
      <PageSection>
        <Loading />
      </PageSection>
    );

  // Note, the logic differs between ingress and egress, see https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#networkpolicyspec-v1-networking-k8s-io
  // A policy affects egress if it is explicitely specified in policyTypes, or if policyTypes isn't set and there is an egress section.
  // A policy affects ingress if it is explicitely specified in policyTypes, or if policyTypes isn't set, regardless the presence of an ingress sections.
  const explicitPolicyTypes = !!networkPolicy.spec.policyTypes;
  const affectsEgress = explicitPolicyTypes
    ? networkPolicy.spec.policyTypes.includes('Egress')
    : !!networkPolicy.spec.egress;
  const affectsIngress = explicitPolicyTypes
    ? networkPolicy.spec.policyTypes.includes('Ingress')
    : true;
  const egressDenied =
    affectsEgress &&
    (!networkPolicy.spec.egress || networkPolicy.spec.egress.length === 0);
  const ingressDenied =
    affectsIngress &&
    (!networkPolicy.spec.ingress || networkPolicy.spec.ingress.length === 0);

  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('NetworkPolicy details')} />
        <div className="row">
          <div className="col-md-6">
            <dl data-test-id="resource-summary" className="co-m-pane__details">
              <DetailsItem
                label={t('Name')}
                obj={networkPolicy}
                path={'metadata.name'}
              />
              {metadata?.namespace && (
                <DetailsItem
                  label={t('Namespace')}
                  obj={networkPolicy}
                  path="metadata.namespace"
                >
                  <ResourceLink
                    kind="Namespace"
                    name={metadata.namespace}
                    title={metadata.uid}
                    namespace={null}
                  />
                </DetailsItem>
              )}
              <DetailsItem
                label={t('Labels')}
                obj={networkPolicy}
                path="metadata.labels"
                valueClassName="details-item__value--labels"
                onEdit={labelsModalLauncher}
                canEdit={canUpdate}
                editAsGroup
              >
                <LabelList
                  groupVersionKind={modelToGroupVersionKind(NetworkPolicyModel)}
                  labels={metadata?.labels}
                />
              </DetailsItem>
              <DetailsItem
                label={t('Annotations')}
                obj={networkPolicy}
                path="metadata.annotations"
              >
                {canUpdate ? (
                  <Button
                    data-test="edit-annotations"
                    type="button"
                    isInline
                    onClick={annotationsModalLauncher}
                    variant="link"
                  >
                    {t('{{count}} annotation', {
                      count: _.size(metadata?.annotations),
                    })}
                    <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
                  </Button>
                ) : (
                  t('{{count}} annotation', {
                    count: _.size(metadata?.annotations),
                  })
                )}
              </DetailsItem>
              <DetailsItem
                label={t('Created at')}
                obj={networkPolicy}
                path="metadata.creationTimestamp"
              >
                <Timestamp timestamp={metadata?.creationTimestamp} />
              </DetailsItem>
              <DetailsItem
                label={t('Owner')}
                obj={networkPolicy}
                path="metadata.ownerReferences"
              >
                <OwnerReferences resource={networkPolicy} />
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
      {affectsIngress && (
        <div className="co-m-pane__body">
          <SectionHeading text={t('Ingress rules')} />
          <p className="co-m-pane__explanation">
            {t(
              'Pods accept all traffic by default. They can be isolated via NetworkPolicies which specify a whitelist of ingress rules. When a Pod is selected by a NetworkPolicy, it will reject all traffic not explicitly allowed via a NetworkPolicy.',
            )}
            {!isManaged() && (
              <Trans t={t}>
                {' '}
                See more details in:{' '}
                <ExternalLink
                  href={getNetworkPolicyDocURL(hasOpenshiftFlag)}
                  text={t('NetworkPolicies documentation')}
                />
                .
              </Trans>
            )}
          </p>
          {ingressDenied ? (
            t('All incoming traffic is denied to Pods in {{namespace}}', {
              namespace: networkPolicy.metadata.namespace,
            })
          ) : (
            <div className="co-m-table-grid co-m-table-grid--bordered">
              <IngressHeader />
              <div className="co-m-table-grid__body">
                {_.map(networkPolicy.spec.ingress, (rule, i) =>
                  consolidatePeers(rule.from).map((row, j) => (
                    <PeerRow
                      key={`${i}_${j}`}
                      row={row}
                      ports={rule.ports}
                      mainPodSelector={networkPolicy.spec.podSelector}
                      namespace={networkPolicy.metadata.namespace}
                    />
                  )),
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {affectsEgress && (
        <div className="co-m-pane__body">
          <SectionHeading text={t('Egress rules')} />
          <p className="co-m-pane__explanation">
            {t(
              'All outgoing traffic is allowed by default. Egress rules can be used to restrict outgoing traffic if the cluster network provider allows it. When using the OpenShift SDN cluster network provider, egress network policy is not supported.',
            )}
            {!isManaged() && (
              <Trans t={t}>
                {' '}
                See more details in:{' '}
                <ExternalLink
                  href={getNetworkPolicyDocURL(hasOpenshiftFlag)}
                  text={t('NetworkPolicies documentation')}
                />
                .
              </Trans>
            )}
          </p>
          {egressDenied ? (
            t('All outgoing traffic is denied from Pods in {{namespace}}', {
              namespace: networkPolicy.metadata.namespace,
            })
          ) : (
            <div className="co-m-table-grid co-m-table-grid--bordered">
              <EgressHeader />
              <div className="co-m-table-grid__body">
                {_.map(networkPolicy.spec.egress, (rule, i) =>
                  consolidatePeers(rule.to).map((row, j) => (
                    <PeerRow
                      key={`${i}_${j}`}
                      row={row}
                      ports={rule.ports}
                      mainPodSelector={networkPolicy.spec.podSelector}
                      namespace={networkPolicy.metadata.namespace}
                    />
                  )),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NetworkPolicyDetails;
