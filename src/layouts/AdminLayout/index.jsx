import { useContext, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// project imports
import MobileHeader from './MobileHeader';
import Navigation from './Navigation';
import NavBar from './NavBar';
import Breadcrumb from './Breadcrumb';
import useWindowSize from 'hooks/useWindowSize';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import Loader from 'components/Loader/Loader';
import UserContext  from '../../context/UserContext'; 
// -----------------------|| ADMIN LAYOUT ||-----------------------//

export default function AdminLayout() {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const bodyElement = document.body;
  const { collapseLayout } = configContext.state;
  const { dispatch } = configContext;

  const { user } = useContext(UserContext); // ✅ get user

  useEffect(() => {
    if (windowSize.width > 992 && windowSize.width <= 1024) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  }, [dispatch, windowSize]);

  if (windowSize.width > 992 && collapseLayout) {
    bodyElement.classList.add('minimenu');
  } else {
    bodyElement.classList.remove('minimenu');
  }

  let containerClass = ['pc-container'];

  let adminlayout = (
    <>
      <MobileHeader />
      <NavBar />
      <div
        style={{
          position: "relative",
          opacity: user?.status === "initial" ? 0.5 : 1,   // make it look disabled
          pointerEvents: user?.status === "initial" ? "none" : "auto", // block clicks
          filter: user?.status === "initial" ? "grayscale(100%)" : "none" // extra gray effect
        }}
      >
        <Navigation />
      </div>



      <div className={containerClass.join(' ')}>
        <div className="pcoded-content p-0">
          <>
            {/*<Breadcrumb />*/}
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </>
        </div>
        
      </div>
    </>
  );
  return <>{adminlayout}</>;
}
