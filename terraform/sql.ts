import { Construct } from 'constructs';
import { SqlDatabaseInstance } from '@cdktf/provider-google/lib/sql-database-instance';
import { ComputeAddress } from '@cdktf/provider-google/lib/compute-address';
import { ComputeForwardingRule } from '@cdktf/provider-google/lib/compute-forwarding-rule';
import { TerraformOutput } from 'cdktf';

interface Props {
    region: string;
    subnetId: string;
    projectId: string;
}

export class SQL extends Construct {

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);


        const pg = new SqlDatabaseInstance(this, 'pg_main', {
            name: 'pg-main',
            region: props.region,
            databaseVersion: 'POSTGRES_17',
            deletionProtection: false,
            settings: {
                tier: 'db-f1-micro',
                edition: 'ENTERPRISE',
                ipConfiguration: {
                    ipv4Enabled: false,
                    pscConfig: [
                        {
                            pscEnabled: true,
                            allowedConsumerProjects: [props.projectId],
                        },
                    ],
                },
            },
        });

        const ipPg = new ComputeAddress(this, 'ip_pg', {
            name: 'ip-pg',
            region: props.region,
            subnetwork: props.subnetId,
            addressType: 'INTERNAL',
        });

        new ComputeForwardingRule(this, 'fr_pg', {
            name: 'fr-main',
            ipAddress: ipPg.id,
            subnetwork: props.subnetId,
            region: props.region,
            loadBalancingScheme: '',
            target: pg.pscServiceAttachmentLink,
        });

        new TerraformOutput(this, 'postgres_ip', {
            value: ipPg.address
        })
    }
}
