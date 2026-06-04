import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fabric_spec')
export class FabricSpec extends BaseEntity {
  @Column({ name: 'spec_code', type: 'varchar', length: 100 })
  specCode: string;

  @Column({ name: 'spec_name', type: 'varchar', length: 200 })
  specName: string;

  @Column({ name: 'fabric_type', type: 'varchar', length: 100 })
  fabricType: string;

  @Column({ name: 'width', type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ name: 'density', type: 'varchar', length: 100, nullable: true })
  density: string;

  @Column({ name: 'yarn_count', type: 'varchar', length: 100, nullable: true })
  yarnCount: string;

  @Column({ name: 'weave_pattern', type: 'varchar', length: 100, nullable: true })
  weavePattern: string;
}
