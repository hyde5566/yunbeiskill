"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const download_controller_1 = require("./download.controller");
const download_service_1 = require("./download.service");
const download_record_entity_1 = require("./entities/download-record.entity");
let DownloadModule = class DownloadModule {
};
exports.DownloadModule = DownloadModule;
exports.DownloadModule = DownloadModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([download_record_entity_1.DownloadRecord])],
        controllers: [download_controller_1.DownloadController],
        providers: [download_service_1.DownloadService],
        exports: [download_service_1.DownloadService],
    })
], DownloadModule);
//# sourceMappingURL=download.module.js.map