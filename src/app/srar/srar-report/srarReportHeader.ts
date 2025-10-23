import { HeaderColumn } from "../SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/report/equipment-table.interface";


export const equipmentRunningHoursHeader: HeaderColumn[][] = [
  [
    { label: 'Sr. No.', key: 'srNo', source: 'main' },
    { label: 'Month Year', key: 'monthYear', source: 'main' },
    { label: 'Ship Name', key: 'ship_name', source: 'main' },
    { label: 'Equipment Code', key: 'equipment_code', source: 'main' },
    { label: 'Eqpt Name', key: 'equipment_name', source: 'main' },
    { label: 'Location On Board', key: 'location_name', source: 'main' },
    { label: 'Hours Underway', key: 'hours_underway', source: 'main' },
    { label: 'Eqpt Running Hours', key: 'equipment_running_hours', source: 'main' },
    { label: 'Engine Hours/Hours Underway', key: 'engineHoursHoursUnderway', source: 'main' },
    { label: 'Engine Hours/Duration (In Days)', key: 'engineHoursDurationInDays', source: 'main' }
  ]
];



export const boilerRunningHoursAndInspectionDetailsHeader: HeaderColumn[][] = [
  [
    { label: 'Sr. No.', rowspan: 3, key: 'srNo', source: 'main' },
    { label: 'Month Year', rowspan: 3, key: 'month_year', source: 'main' },
    { label: 'Eqpt Code', rowspan: 3, key: 'equipment_code', source: 'main' },
    { label: 'Boiler Name', rowspan: 3, key: 'boiler_name', source: 'main' },
    { label: 'Ship Name', rowspan: 3, key: 'ship_name', source: 'main' },
    { label: 'Location On Board', rowspan: 3, key: 'location_name', source: 'main' },
    { label: 'Last Internal Cleaning Date', rowspan: 3, key: 'last_int_clg_date', source: 'main' },
    { label: 'Last External Cleaning Date', rowspan: 3, key: 'last_ext_clg_date', source: 'main' },
    { label: 'Hours Steamed', colspan: 3 },
    { label: 'Highest Salinity', rowspan: 3, key: 'highest_salinity_during_month', source: 'main' },
    { label: 'Lowest Alkalinity', rowspan: 3, key: 'lowest_salinity_during_month', source: 'main' }
  ],
  [
    { label: 'During The Month', rowspan: 2, key: 'life_assessed_in_months', source: 'main' },
    { label: 'Since Last', colspan: 2 }
  ],
  [
    { label: 'Internal Cleaning', key: 'last_int_clg_date', source: 'main' },
    { label: 'External Cleaning', key: 'last_ext_clg_date', source: 'main' }
  ]
];



export const consumptionLubricantHeader: HeaderColumn[][] = [
  [
    { label: 'Sr. No.', key: 'srNo', source: 'main' },
    { label: 'Month And Year', key: 'monthYear', source: 'main' },
    { label: 'Ship Name', key: 'shipName', source: 'main' },
    { label: 'Lubricant Type', key: 'lubricantType', source: 'main' },
    { label: 'Lubricant Name', key: 'lubricantName', source: 'main' },
    { label: 'Lubricant Qty', key: 'lubricantQty', source: 'main' },
    { label: 'Lubricant Unit', key: 'lubricantUnit', source: 'main' }
  ]
];

export const hoursUnderwayDistanceRunHeader: any = [
  [
    { label: 'Sr. No.', key: 'srNo', source: 'main' },
    { label: 'Ship Name', key: 'ship_name', source: 'main' },
    { label: 'SRAR Month', key: 'sfar_month', source: 'main' },
    { label: 'Hours Underway', key: 'hours_underway', source: 'main' },
    { label: 'Distance Run', key: 'distance_run', source: 'main' },
    { label: 'AVG Speed', key: 'avg_speed', source: 'main' },
    { label: 'Days at Sea', key: 'days_at_sea', source: 'main' }
  ]
];


export const cumulativeShipActivityHeader: HeaderColumn[][] = [
  [
    { label: 'Sr.No', rowspan: 2, key: 'srNo', source: 'main' },
    { label: 'Ship Name', rowspan: 2, key: 'shipName', source: 'main' },
    { label: 'At Sea', colspan: 6 },
    { label: 'At Harbour', colspan: 10 },
    { label: 'Cumulative Days', rowspan: 2, key: 'cumulativeDays', source: 'main' }
  ],
  [
    { label: 'Operational Exercise.', key: 'operationalExercise', source: 'main' },
    { label: 'Special Duty.', key: 'specialDuty', source: 'main' },
    { label: 'Refit Trial', key: 'refitTrial', source: 'main' },
    { label: 'Independent Passage.', key: 'independentPassage', source: 'main' },
    { label: 'Materially ready', key: 'materiallyReady', source: 'main' },
    { label: 'Materially Not ready', key: 'materiallyNotReady', source: 'main' },
    { label: 'Refit.', key: 'refit', source: 'main' },
    { label: 'Dry Docking', key: 'dryDocking', source: 'main' },
    { label: 'AMP.', key: 'amp', source: 'main' },
    { label: 'SMP.', key: 'smp', source: 'main' },
    { label: 'Operational Training', key: 'operationalTraining', source: 'main' },
    { label: 'Harbor Trials', key: 'harborTrials', source: 'main' },
    { label: 'Other Activities', key: 'otherActivities', source: 'main' },
    { label: 'OPDEF', key: 'opdef', source: 'main' },
    { label: 'Deployment away from home port', key: 'deploymentAwayFromHomePort', source: 'main' },
    { label: 'OPDEF STA', key: 'opdefSta', source: 'main' }
  ]
];

export const shipActivityDetailsHeader: HeaderColumn[][] = [
  [
    { label: 'Sr. No.', key: 'srNo', source: 'main' },
    { label: 'Activity Date', key: 'activityDate', source: 'main' },
    { label: 'Ship Code', key: 'shipCode', source: 'main' },
    { label: 'Ship Name', key: 'shipName', source: 'main' },
    { label: 'Activity Name', key: 'activityName', source: 'main' },
    { label: 'Activity Start Date', key: 'activityStartDate', source: 'main' },
    { label: 'Activity End Date', key: 'activityEndDate', source: 'main' },
    { label: 'Duration In Days', key: 'durationInDays', source: 'main' }
  ]
];

export const eqptRhExtensionHeader: HeaderColumn[][] = [
  [
    { label: 'Command', key: 'command', source: 'main' },
    { label: 'Class', key: 'class', source: 'main' },
    { label: 'Shipname', key: 'shipName', source: 'main' },
    { label: 'Department', key: 'department', source: 'main' },
    { label: 'Equipment Name', key: 'equipmentName', source: 'main' },
    { label: 'Ops Authority', key: 'opsAuthority', source: 'main' },
    { label: 'Next Routine Due', key: 'nextRoutineDue', source: 'main' },
    { label: 'Extension Details', key: 'extensionDetails', source: 'main' },
    { label: 'Extension HRS', key: 'extensionHrs', source: 'main' },
    { label: 'Authority Referance', key: 'authorityReference', source: 'main' },
    { label: 'Reason For Extension', key: 'reasonForExtension', source: 'main' },
    { label: 'Total Extension Details', key: 'totalExtensionDetails', source: 'main' },
    { label: 'Remarks', key: 'remarks', source: 'main' }
  ]
];

export const overallActivityInPlatformsHeader: HeaderColumn[][] = [
  [
    { label: 'Sr No', key: 'srNo', source: 'main' },
    { label: 'Class Name', key: 'className', source: 'main' },
    { label: 'Ship Name', key: 'shipName', source: 'main' },
    { label: 'Operational Exercise.', key: 'operationalExercise', source: 'main' },
    { label: 'Special Duty.', key: 'specialDuty', source: 'main' },
    { label: 'Refit Trial', key: 'refitTrial', source: 'main' },
    { label: 'Independent Passage.', key: 'independentPassage', source: 'main' },
    { label: 'Total Days at Sea', key: 'totalDaysAtSea', source: 'main' },
    { label: 'Materially ready', key: 'materiallyReady', source: 'main' },
    { label: 'Materially Not ready', key: 'materiallyNotReady', source: 'main' },
    { label: 'Refit.', key: 'refit', source: 'main' },
    { label: 'AMP.', key: 'amp', source: 'main' },
    { label: 'SMP.', key: 'smp', source: 'main' },
    { label: 'Total No of Ship days', key: 'totalNoOfShipDays', source: 'main' },
    { label: '% ops avail', key: 'percentOpsAvail', source: 'main' },
    { label: '% day at sea', key: 'percentDayAtSea', source: 'main' },
    { label: '% util', key: 'percentUtil', source: 'main' },
    { label: '% Maint', key: 'percentMaint', source: 'main' }
  ]
];

export const fuelConsumptionMonthWiseHeader: HeaderColumn[][] = [
  [
    { label: 'SHIP NAME', rowspan: 2, key: 'shipName', source: 'main' },
    { label: 'Category', rowspan: 2, key: 'category', source: 'main' },
    { label: 'Command', rowspan: 2, key: 'command', source: 'main' },
    { label: 'Class', rowspan: 2, key: 'class', source: 'main' },
    { label: 'Ops Authority', rowspan: 2, key: 'opsAuthority', source: 'main' },
    { label: 'Jan--2021', colspan: 4 },
    { label: 'Feb--2022', colspan: 4 }
  ],
  [
    { label: 'At Harbour', key: 'jan2021AtHarbour', source: 'main' },
    { label: 'At Anchorage', key: 'jan2021AtAnchorage', source: 'main' },
    { label: 'At Sea', key: 'jan2021AtSea', source: 'main' },
    { label: 'Total', key: 'jan2021Total', source: 'main' },
    { label: 'At Harbour', key: 'feb2022AtHarbour', source: 'main' },
    { label: 'At Anchorage', key: 'feb2022AtAnchorage', source: 'main' },
    { label: 'At Sea', key: 'feb2022AtSea', source: 'main' },
    { label: 'Total', key: 'feb2022Total', source: 'main' }
  ]
];

export const fuelConsumptionPropulsionWiseHeader: HeaderColumn[][] = [
  [
    { label: 'DIESEL', colspan: 2 },
    { label: '01 Apr 2022 To 31 Dec 2022', colspan: 15 }
  ],

  [
    { label: 'Sr. No.', rowspan: 2, key: 'srNo', source: 'main' },
    { label: 'Type Of Propulsion', rowspan: 2, key: 'typeOfPropulsion', source: 'main' },
    { label: 'SHIP', rowspan: 2, key: 'ship', source: 'main' },
    { label: 'Hours Underway', rowspan: 2, key: 'hoursUnderway', source: 'main' },
    { label: 'Days At Sea', rowspan: 2, key: 'daysAtSea', source: 'main' },
    { label: 'Days At Harb', rowspan: 2, key: 'daysAtHarb', source: 'main' },
    { label: 'Distance Run', rowspan: 2, key: 'distanceRun', source: 'main' },
    { label: 'Engine Hours', rowspan: 2, key: 'engineHours', source: 'main' },
    { label: 'Calculated EEF', rowspan: 2, key: 'calculatedEEF', source: 'main' },
    { label: 'Fuel At Harbour', rowspan: 2, key: 'fuelAtHarbour', source: 'main' },
    { label: 'Fuel At Anchorage', rowspan: 2, key: 'fuelAtAnchorage', source: 'main' },
    { label: 'Fuel At Sea', rowspan: 2, key: 'fuelAtSea', source: 'main' },
    { label: 'Total Fuel', rowspan: 2, key: 'totalFuel', source: 'main' },
    { label: 'Fuel At Harb/ Days At Harb', rowspan: 2, key: 'fuelAtHarbDaysAtHarb', source: 'main' },
    { label: 'Fuel At Sea/ Hours Underway', rowspan: 2, key: 'fuelAtSeaHoursUnderway', source: 'main' },
    { label: 'Distance Run / Fuel Consumed At Sea', rowspan: 2, key: 'distanceRunFuelConsumedAtSea', source: 'main' }
  ],
  [
    // Empty row as all columns have rowspan: 2
  ]
];

export const h2sSensorStatusHeader: HeaderColumn[][] = [
  [
    { label: 'Sr.No.', key: 'srNo', source: 'main' },
    { label: 'Sensor Name', key: 'sensorName', source: 'main' },
    { label: 'Location On Board', key: 'locationOnBoard', source: 'main' },
    { label: 'Ops', key: 'ops', source: 'main' },
    { label: 'Non Ops', key: 'nonOps', source: 'main' },
    { label: 'Calibration Date', key: 'calibrationDate', source: 'main' },
    { label: 'Next Calibration Date', key: 'nextCalibrationDate', source: 'main' }
  ]
];

export const srarAnualMonthReportHeader: HeaderColumn[][] = [
  [
    { label: 'SNO', key: 'sno', source: 'main' },
    { label: 'Ship ID', key: 'shipId', source: 'main' },
    { label: 'Shipname', key: 'shipname', source: 'main' },
    { label: 'Ops Authority', key: 'opsAuthority', source: 'main' },
    { label: 'Command Name', key: 'commandName', source: 'main' },
    { label: 'Class', key: 'class', source: 'main' },
    { label: 'Ship Category Name', key: 'shipCategoryName', source: 'main' },
    { label: 'Displacement', key: 'displacement', source: 'main' },
    { label: 'Commission Date', key: 'commissionDate', source: 'main' },
    { label: 'Decommission Date', key: 'decommissionDate', source: 'main' },
    { label: 'Age Of Ship', key: 'ageOfShip', source: 'main' },
    { label: 'Days in Year', key: 'daysInYear', source: 'main' },
    { label: 'Operational Exercise', key: 'operationalExercise', source: 'main' },
    { label: 'Special Duty', key: 'specialDuty', source: 'main' },
    { label: 'Sea Trial', key: 'seaTrial', source: 'main' },
    { label: 'Independent Passage', key: 'independentPassage', source: 'main' },
    { label: 'Anchorage', key: 'anchorage', source: 'main' },
    { label: 'Operational Sea Training', key: 'operationalSeaTraining', source: 'main' },
    { label: 'Days in Sea', key: 'daysInSea', source: 'main' },
    { label: 'AMP', key: 'amp', source: 'main' },
    { label: 'SMP', key: 'smp', source: 'main' },
    { label: 'OPDEFSTA', key: 'opdefsta', source: 'main' },
    { label: 'Refit', key: 'refit', source: 'main' }
  ]
];

export const srarGtgUtilisationHeader: HeaderColumn[][] = [
  [
    { label: 'Sr. No.', key: 'srNo', source: 'main' },
    { label: 'Class', key: 'class', source: 'main' },
    { label: 'ShipName', key: 'shipName', source: 'main' },
    { label: 'Hours Underway', key: 'hoursUnderway', source: 'main' },
    { label: 'Cummulative CTC Running Hours', key: 'cummulativeCtcRunningHours', source: 'main' },
    { label: 'Calculative GUF', key: 'calculativeGuf', source: 'main' },
    { label: 'GUF Ship', key: 'gufShip', source: 'main' },
    { label: 'GUF Limit For % difference Of Ship', key: 'gufLimitPercentDifferenceOfShip', source: 'main' }
  ]
];

export const fptCstReportHeader: HeaderColumn[][] = [
  [
    { label: 'SR. No', key: 'srNo', source: 'main' },
    { label: 'Ship Name', key: 'shipName', source: 'main' },
    { label: 'Universal ID M Ship', key: 'universalIdMShip', source: 'main' },
    { label: 'Equipment Name', key: 'equipmentName', source: 'main' },
    { label: 'Ops Authority', key: 'opsAuthority', source: 'main' },
    { label: 'Command Name', key: 'commandName', source: 'main' },
    { label: 'CLASS', key: 'class', source: 'main' },
    { label: 'CST Displacement', key: 'cstDisplacement', source: 'main' },
    { label: 'Rated Erpm', key: 'ratedErpm', source: 'main' },
    { label: 'Rated Pitch', key: 'ratedPitch', source: 'main' },
    { label: 'CST Erpm Achived', key: 'cstErpmAchived', source: 'main' },
    { label: 'CST Pitch Achived', key: 'cstPitchAchived', source: 'main' },
    { label: 'CST Speed', key: 'cstSpeed', source: 'main' },
    { label: 'Last Docking Date', key: 'lastDockingDate', source: 'main' },
    { label: 'Last Undocking Date', key: 'lastUndockingDate', source: 'main' }
  ]
];

export const srarAverageSpeedAnnualReportHeader: HeaderColumn[][] = [
  [
    { label: 'Sr.No', key: 'srNo', source: 'main' },
    { label: 'Propulsion', key: 'propulsion', source: 'main' },
    { label: 'Class', key: 'class', source: 'main' },
    { label: 'Command', key: 'command', source: 'main' },
    { label: 'ShipName', key: 'shipName', source: 'main' },
    { label: 'OpsAuthority', key: 'opsAuthority', source: 'main' },
    { label: 'ShipCategoryName', key: 'shipCategoryName', source: 'main' },
    { label: 'Ops Order', key: 'opsOrder', source: 'main' },
    { label: 'DayAtSea', key: 'dayAtSea', source: 'main' },
    { label: 'DayAtHarb', key: 'dayAtHarb', source: 'main' },
    { label: 'Hours Underway', key: 'hoursUnderway', source: 'main' },
    { label: 'DistanceRunMonth', key: 'distanceRunMonth', source: 'main' },
    { label: 'EquipmentRunningHours', key: 'equipmentRunningHours', source: 'main' },
    { label: 'Calculated EEF', key: 'calculatedEEF', source: 'main' },
    { label: 'FuelAtHarb', key: 'fuelAtHarb', source: 'main' },
    { label: 'FuelAtAnchorage', key: 'fuelAtAnchorage', source: 'main' },
    { label: 'FuelAtSea', key: 'fuelAtSea', source: 'main' },
    { label: 'FuelTotal', key: 'fuelTotal', source: 'main' },
    { label: 'FuelAtHarb', key: 'fuelAtHarb2', source: 'main' }
  ]
];

