import React from 'react';
import type { ServiceConfig } from './types';
import RegisterLeague from './components/RegisterLeague/RegisterLeague';
import RegisterTraining from './components/RegisterTraining/RegisterTraining';
import RegisterCamps from './components/RegisterCamps/RegisterCamps';
import RegisterBirthday from './components/RegisterBirthday/RegisterBirthday';
import RegisterPickup from './components/RegisterPickup/RegisterPickup';
import RegisterFieldRental from './components/RegisterFieldRental/RegisterFieldRental';

interface RegisterProps {
  config: ServiceConfig;
}

const Register: React.FC<RegisterProps> = ({ config }) => {
  const ComponentMap = {
    league: RegisterLeague,
    training: RegisterTraining,
    camps: RegisterCamps,
    birthday: RegisterBirthday,
    pickup: RegisterPickup,
    fieldRental: RegisterFieldRental,
  };

  const Component = ComponentMap[config.type];
  
  return <Component />;
};

export default Register;
