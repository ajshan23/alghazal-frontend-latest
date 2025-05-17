import appsNavigationConfig from './apps.navigation.config'
import uiComponentNavigationConfig from './ui-components.navigation.config'
import pagesNavigationConfig from './pages.navigation.config'
import authNavigationConfig from './auth.navigation.config'
import docNavigationConfig from './doc.navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import engNavigationConfig from './apps.engineer.config'
import drvNavigationConfig from './apps.driver.config'

const navigationConfig: NavigationTree[] = [
    ...appsNavigationConfig,
    ...engNavigationConfig,
    ...drvNavigationConfig,
    // ...uiComponentNavigationConfig,
    // ...pagesNavigationConfig,
    // ...authNavigationConfig,
    // ...docNavigationConfig,
]

export default navigationConfig
