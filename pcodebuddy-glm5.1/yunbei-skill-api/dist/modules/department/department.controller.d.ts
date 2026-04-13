import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    findAll(): Promise<import("./entities/department.entity").Department[]>;
    getTree(): Promise<any[]>;
    findOne(id: number): Promise<import("./entities/department.entity").Department>;
    getMembers(id: number): Promise<any[]>;
    create(createDto: CreateDepartmentDto): Promise<import("./entities/department.entity").Department>;
    update(id: number, updateDto: UpdateDepartmentDto): Promise<import("./entities/department.entity").Department>;
    remove(id: number): Promise<void>;
}
