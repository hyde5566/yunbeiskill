import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentService {
    private departmentRepository;
    constructor(departmentRepository: Repository<Department>);
    create(createDto: CreateDepartmentDto): Promise<Department>;
    findAll(): Promise<Department[]>;
    getTree(): Promise<any[]>;
    private buildTree;
    findOne(id: number): Promise<Department>;
    update(id: number, updateDto: UpdateDepartmentDto): Promise<Department>;
    remove(id: number): Promise<void>;
    getMembers(departmentId: number): Promise<any[]>;
    private getAllChildIds;
}
