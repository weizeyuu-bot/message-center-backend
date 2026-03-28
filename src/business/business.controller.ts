import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('suppliers')
  listSuppliers() {
    return this.businessService.listSuppliers();
  }

  @Get('suppliers/:id')
  getSupplier(@Param('id') id: string) {
    return this.businessService.getSupplier(id);
  }

  @Post('suppliers')
  createSupplier(@Body() dto: any) {
    return this.businessService.createSupplier(dto);
  }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updateSupplier(id, dto);
  }

  @Post('suppliers/:id/submit-approval')
  submitSupplierApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.submitSupplierApproval(id, dto);
  }

  @Post('suppliers/:id/approve')
  approveSupplierApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.approveSupplierApproval(id, dto);
  }

  @Post('suppliers/:id/reject')
  rejectSupplierApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.rejectSupplierApproval(id, dto);
  }

  @Delete('suppliers/:id')
  deleteSupplier(@Param('id') id: string) {
    return this.businessService.deleteSupplier(id);
  }

  @Get('materials')
  listMaterials() {
    return this.businessService.listMaterials();
  }

  @Get('materials/:id')
  getMaterial(@Param('id') id: string) {
    return this.businessService.getMaterial(id);
  }

  @Post('materials')
  createMaterial(@Body() dto: any) {
    return this.businessService.createMaterial(dto);
  }

  @Patch('materials/:id')
  updateMaterial(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updateMaterial(id, dto);
  }

  @Post('materials/:id/submit-approval')
  submitMaterialApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.submitMaterialApproval(id, dto);
  }

  @Post('materials/:id/approve')
  approveMaterialApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.approveMaterialApproval(id, dto);
  }

  @Post('materials/:id/reject')
  rejectMaterialApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.rejectMaterialApproval(id, dto);
  }

  @Delete('materials/:id')
  deleteMaterial(@Param('id') id: string) {
    return this.businessService.deleteMaterial(id);
  }

  @Get('price-records')
  listPriceRecords() {
    return this.businessService.listPriceRecords();
  }

  @Get('price-records/:id')
  getPriceRecord(@Param('id') id: string) {
    return this.businessService.getPriceRecord(id);
  }

  @Post('price-records')
  createPriceRecord(@Body() dto: any) {
    return this.businessService.createPriceRecord(dto);
  }

  @Patch('price-records/:id')
  updatePriceRecord(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updatePriceRecord(id, dto);
  }

  @Delete('price-records/:id')
  deletePriceRecord(@Param('id') id: string) {
    return this.businessService.deletePriceRecord(id);
  }

  @Get('purchase-orders')
  listPurchaseOrders() {
    return this.businessService.listPurchaseOrders();
  }

  @Get('purchase-orders/:id')
  getPurchaseOrder(@Param('id') id: string) {
    return this.businessService.getPurchaseOrder(id);
  }

  @Post('purchase-orders')
  createPurchaseOrder(@Body() dto: any) {
    return this.businessService.createPurchaseOrder(dto);
  }

  @Patch('purchase-orders/:id')
  updatePurchaseOrder(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updatePurchaseOrder(id, dto);
  }

  @Post('purchase-orders/:id/submit-approval')
  submitPurchaseOrderApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.submitPurchaseOrderApproval(id, dto);
  }

  @Post('purchase-orders/:id/approve')
  approvePurchaseOrderApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.approvePurchaseOrderApproval(id, dto);
  }

  @Post('purchase-orders/:id/reject')
  rejectPurchaseOrderApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.rejectPurchaseOrderApproval(id, dto);
  }

  @Delete('purchase-orders/:id')
  deletePurchaseOrder(@Param('id') id: string) {
    return this.businessService.deletePurchaseOrder(id);
  }

  @Get('delivery-plans')
  listDeliveryPlans() {
    return this.businessService.listDeliveryPlans();
  }

  @Get('delivery-plans/:id')
  getDeliveryPlan(@Param('id') id: string) {
    return this.businessService.getDeliveryPlan(id);
  }

  @Post('delivery-plans')
  createDeliveryPlan(@Body() dto: any) {
    return this.businessService.createDeliveryPlan(dto);
  }

  @Patch('delivery-plans/:id')
  updateDeliveryPlan(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updateDeliveryPlan(id, dto);
  }

  @Post('delivery-plans/:id/submit-approval')
  submitDeliveryPlanApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.submitDeliveryPlanApproval(id, dto);
  }

  @Post('delivery-plans/:id/approve')
  approveDeliveryPlanApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.approveDeliveryPlanApproval(id, dto);
  }

  @Post('delivery-plans/:id/reject')
  rejectDeliveryPlanApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.rejectDeliveryPlanApproval(id, dto);
  }

  @Delete('delivery-plans/:id')
  deleteDeliveryPlan(@Param('id') id: string) {
    return this.businessService.deleteDeliveryPlan(id);
  }

  @Get('invoices')
  listInvoices() {
    return this.businessService.listInvoices();
  }

  @Get('invoices/:id')
  getInvoice(@Param('id') id: string) {
    return this.businessService.getInvoice(id);
  }

  @Post('invoices')
  createInvoice(@Body() dto: any) {
    return this.businessService.createInvoice(dto);
  }

  @Patch('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.updateInvoice(id, dto);
  }

  @Post('invoices/:id/submit-approval')
  submitInvoiceApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.submitInvoiceApproval(id, dto);
  }

  @Post('invoices/:id/approve')
  approveInvoiceApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.approveInvoiceApproval(id, dto);
  }

  @Post('invoices/:id/reject')
  rejectInvoiceApproval(@Param('id') id: string, @Body() dto: any) {
    return this.businessService.rejectInvoiceApproval(id, dto);
  }

  @Delete('invoices/:id')
  deleteInvoice(@Param('id') id: string) {
    return this.businessService.deleteInvoice(id);
  }
}