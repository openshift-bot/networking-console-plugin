export * from './nads';

export const ALL_NAMESPACES_KEY = '#ALL_NS#';
export const ALL_NAMESPACES = 'all-namespaces';
export const DEFAULT_NAMESPACE = 'default';

export enum FLAGS {
  AUTH_ENABLED = 'AUTH_ENABLED',
  CAN_CREATE_PROJECT = 'CAN_CREATE_PROJECT',
  CAN_GET_NS = 'CAN_GET_NS',
  CAN_LIST_CRD = 'CAN_LIST_CRD',
  CAN_LIST_GROUPS = 'CAN_LIST_GROUPS',
  CAN_LIST_NODE = 'CAN_LIST_NODE',
  CAN_LIST_NS = 'CAN_LIST_NS',
  CAN_LIST_OPERATOR_GROUP = 'CAN_LIST_OPERATOR_GROUP',
  CAN_LIST_PACKAGE_MANIFEST = 'CAN_LIST_PACKAGE_MANIFEST',
  CAN_LIST_PV = 'CAN_LIST_PV',
  CAN_LIST_USERS = 'CAN_LIST_USERS',
  CAN_LIST_VSC = 'CAN_LIST_VSC',
  CLUSTER_API = 'CLUSTER_API',
  CLUSTER_AUTOSCALER = 'CLUSTER_AUTOSCALER',
  CLUSTER_VERSION = 'CLUSTER_VERSION',
  CONSOLE_CLI_DOWNLOAD = 'CONSOLE_CLI_DOWNLOAD',
  CONSOLE_EXTERNAL_LOG_LINK = 'CONSOLE_EXTERNAL_LOG_LINK',
  CONSOLE_LINK = 'CONSOLE_LINK',
  CONSOLE_NOTIFICATION = 'CONSOLE_NOTIFICATION',
  CONSOLE_YAML_SAMPLE = 'CONSOLE_YAML_SAMPLE',
  MACHINE_AUTOSCALER = 'MACHINE_AUTOSCALER',
  MACHINE_CONFIG = 'MACHINE_CONFIG',
  MACHINE_HEALTH_CHECK = 'MACHINE_HEALTH_CHECK',
  MONITORING = 'MONITORING',
  OPENSHIFT = 'OPENSHIFT',
  PROMETHEUS = 'PROMETHEUS',
  SHOW_OPENSHIFT_START_GUIDE = 'SHOW_OPENSHIFT_START_GUIDE',
}
