let InitState = {
  isNpmInstall: '1',
  incExc: 1,
  tipModalVisible: false,
  projectId: '-1',
  tipModalCheckVisible: 'block',
  code_url: '',
  checkoutLoading: false,
  buildLoading: false,
  branchDeploy: false,
  canQuickDeploy: false,
  tagLoading: false,
  deployLoading: false,
  quickDeployLoading: false,
  addData: [],
  changeData: [],
  authors: [],
  showChangeLog: [],
  isShowChangeModal: false,
  sameData: [],
  buildLog: '',
  diffModalVisible: false,
  selectedFiles: [],
  selectedMachines: [],
  buildTask: '',
  buildDesc: '',
  buildPass: '',
  buildType: 1,
  sendOp: false,
  selectedMacRowKeys: [],
  infoCol: [
    {
      title: '基本信息：',
      width: '100px',
      dataIndex: 'keyName'
    }, {
      title: '',
      width: '700px',
      dataIndex: 'keyValue'
    }
  ],
  selectedRowKeys: {
    'add': [],
    'change': [],
    'same': []
  },
  curTab: 'add',
  infoData: [],
  machineList: [],
  canBuild: false,
  canTag: false,
  TagText: '打tag',
  canDeploy: false,
  canNotify: true,
  debug: false,
  notifyCharger: false
};
export  default  InitState;
