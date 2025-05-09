import { Construct } from 'constructs';
import { ContainerCluster } from '@cdktf/provider-google/lib/container-cluster';
import { ComputeRouter } from '@cdktf/provider-google/lib/compute-router';
import { ComputeRouterNat } from '@cdktf/provider-google/lib/compute-router-nat';
import { ArtifactRegistryRepository } from '@cdktf/provider-google/lib/artifact-registry-repository';

interface Props {
    region: string;
    vpcId: string;
    subnetName: string;
    k8sLocation: string;
    controlPlaneCidrs: Record<string, string>; // { name: cidr }
}

export class GKE extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        new ContainerCluster(this, 'k8s_main', {
            name: 'k8s-main',
            location: props.k8sLocation,
            network: props.vpcId,
            subnetwork: props.subnetName,
            initialNodeCount: 1,
            deletionProtection: false,
            privateClusterConfig: {
                enablePrivateNodes: true,
                enablePrivateEndpoint: false,
            },
            masterAuthorizedNetworksConfig: {
                cidrBlocks: Object.entries(props.controlPlaneCidrs).map(([name, cidrBlock]) => ({
                    name,
                    cidrBlock,
                })),
            },
        });

        const router = new ComputeRouter(this, 'router_main', {
            name: 'router-main',
            network: props.vpcId,
            region: props.region,
        });

        new ComputeRouterNat(this, 'nat_main', {
            name: 'nat-main',
            router: router.name,
            region: props.region,
            natIpAllocateOption: 'AUTO_ONLY',
            sourceSubnetworkIpRangesToNat: 'LIST_OF_SUBNETWORKS',
            subnetwork: [
                {
                    name: props.subnetName,
                    sourceIpRangesToNat: ["PRIMARY_IP_RANGE"]
                }
            ]
        });

        new ArtifactRegistryRepository(this, 'cr_main', {
            repositoryId: "sisuxgleb",
            format: "DOCKER",
            location: props.region
        })
    }
}
