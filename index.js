/**
 * @format
 */

// IMPORTANT: Import global font FIRST before anything else
// This must be imported before App to ensure font patching happens early
// import './GlobalFont';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
