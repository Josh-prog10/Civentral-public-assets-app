import WaterDrainageAdminScreen from '@/src/modules/water-supply-drainage/pages/WaterDrainageAdminScreen';
import WaterSupplyDrainagePage from '@/src/modules/water-supply-drainage/pages/WaterSupplyDrainagePage';
import { AuthService } from '@/src/services/auth-service';
import { Redirect } from 'expo-router';
import React from 'react';

export default function WaterRequestsRoute() {
  const session = AuthService.getCurrentUser();
  if (session.isGuest) {
    return <Redirect href="/(auth)" />;
  }
  if (session.accountType === 'employee') return <WaterDrainageAdminScreen />;
  return <WaterSupplyDrainagePage />;
}
