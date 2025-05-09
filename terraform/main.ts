import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { GoogleProvider } from '@cdktf/provider-google/lib/provider';
import { ComputeNetwork } from '@cdktf/provider-google/lib/compute-network';
import { ComputeSubnetwork } from '@cdktf/provider-google/lib/compute-subnetwork';
import { GKE } from './k8s';
import { SQL } from './sql'

class Root extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const projectId = '-'
    const region = 'europe-west1'
    const k8sLocation = 'europe-west1-c'

    new GoogleProvider(this, 'google', {
      project: projectId,
    });

    const vpc = new ComputeNetwork(this, 'vpc_main', {
      name: 'vpc-main',
    });

    const subnetGKE = new ComputeSubnetwork(this, 'subnet_gke', {
      name: 'subnet-gke',
      ipCidrRange: '172.20.0.0/24',
      region: region,
      network: vpc.id,
    });

    const subnetSQL = new ComputeSubnetwork(this, 'subnet_sql', {
      name: 'subnet-sql',
      ipCidrRange: '172.20.1.0/24',
      region: region,
      network: vpc.id,
    });

    new GKE(this, 'GKE', {
      vpcId: vpc.id,
      subnetName: subnetGKE.name,
      region: region,
      k8sLocation: k8sLocation,
      controlPlaneCidrs: {
        home: '91.129.103.153/32', // Just became public info
        vpn: '10.26.32.12/32',
        vpn2: '19.104.105.29/32',
      },
    });

    new SQL(this, 'sql', {
      region: region,
      subnetId: subnetSQL.id,
      projectId,
    })

  }
}

const app = new App();
new Root(app, 'Root');
app.synth();
