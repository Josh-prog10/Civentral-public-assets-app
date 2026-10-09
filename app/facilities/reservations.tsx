import FacilitiesReservationSystem from '@/src/modules/facility-reservation/FacilitiesReservationSystem';
import { AuthService } from '@/src/services/auth-service';
import { Redirect } from 'expo-router';
import React from 'react';

export default function FacilitiesReservationsRoute() {
  const session = AuthService.getCurrentUser();
  if (session.isGuest || session.accountType !== 'employee') {
    return <Redirect href="/(auth)/employee-login" />;
  }
  return <FacilitiesReservationSystem />;
}
