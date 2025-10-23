import { Pipe, PipeTransform } from '@angular/core';
import { ShipReadinessDetail, ShipCategoryCount, YearDaysAtSea } from '../../srar/models/unified-data.model';

@Pipe({
  name: 'calculateTotalReadyDays',
  standalone: true
})
export class CalculateTotalReadyDaysPipe implements PipeTransform {
  transform(data: ShipReadinessDetail[]): number {
    return data.reduce((sum, ship) => sum + ship.operationalReady, 0);
  }
}

@Pipe({
  name: 'calculateAverageMaintenance',
  standalone: true
})
export class CalculateAverageMaintenancePipe implements PipeTransform {
  transform(data: ShipReadinessDetail[]): string {
    if (!data || data.length === 0) return '0';
    const totalMaintenance = data.reduce((sum, ship) => sum + ship.maintenance, 0);
    return (totalMaintenance / data.length).toFixed(1);
  }
}

@Pipe({
  name: 'calculateTotalVessels',
  standalone: true
})
export class CalculateTotalVesselsPipe implements PipeTransform {
  transform(data: ShipCategoryCount[]): number {
    return data.reduce((sum, category) => sum + category.activeCount, 0);
  }
}

@Pipe({
  name: 'calculateAverageDaysAtSea',
  standalone: true
})
export class CalculateAverageDaysAtSeaPipe implements PipeTransform {
  transform(data: YearDaysAtSea[]): string {
    if (!data || data.length === 0) return '0';
    const totalDays = data.reduce((sum, yearData) => sum + yearData.daysAtSea, 0);
    return (totalDays / data.length).toFixed(1);
  }
}