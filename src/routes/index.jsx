import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// Layouts
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

// Pages
const Dashboard = lazy(() => import('../views/dashboard/Dashboard'));
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));
const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));
const Sample = lazy(() => import('../views/sample'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));


const Logout = lazy(() => import('../views/Logout.jsx'));

import Profile from '../views/Profile';

const ShowAllUsers = lazy(() => import('../views/ShowAllUsers.jsx'));

const AddAcademicYear = lazy(() => import('../views/AddAcademicYear.jsx'));
const ShowAcademicYear = lazy(() => import('../views/ShowAcademicYears.jsx'));

const AddMiscellaneous = lazy(() => import('../views/AddMiscellaneous.jsx'));
const ShowMiscellaneous = lazy(() => import('../views/ShowMiscellaneous.jsx'));
const AddMiscellaneousPackage = lazy(() => import('../views/AddMiscellaneousPackage.jsx'));
const ShowMiscellaneousPackages = lazy(() => import('../views/ShowMiscellaneousPackages.jsx'));

const AddProgram = lazy(() => import('../views/AddProgram.jsx'));
const ShowPrograms = lazy(() => import('../views/ShowPrograms.jsx'));

const AddStudent = lazy(() => import('../views/AddStudent.jsx'));
const ShowStudents = lazy(() => import('../views/ShowStudents.jsx'));
const Enroll = lazy(() => import('../views/Enroll.jsx'));
const Enrollments = lazy(() => import('../views/Enrollments.jsx'));

const ErrorPage = () => <h1>Page Not Found</h1>;

const router = createBrowserRouter(
  [
    // Guest routes
    {
      path: '/',
      element: <GuestLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: 'login', element: <Login /> },
      ]
    },

    // Admin routes
    {
      path: '/',
      element: <AdminLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <Dashboard />,
          children: [
            // Default after login
            { index: true, element: <Navigate to="/dashboard/home" replace /> },

            // Pages
            { path: 'dashboard/home', element: <h1>Welcome to Dashboard</h1> },
            { path: 'register', element: <Register /> },
            { path: 'profile', element: <Profile /> },
            { path: 'all-users', element: <ShowAllUsers /> },
            { path: 'logout', element: <Logout /> },
            
            { path: 'students/add', element: <AddStudent /> },
            { path: 'students', element: <ShowStudents /> },

            { path: 'enroll', element: <Enroll /> },
            { path: 'enrollments', element: <Enrollments /> },


            { path: 'academic-year/add', element: <AddAcademicYear /> },
            { path: 'academic-year', element: <ShowAcademicYear /> },


            { path: 'miscellaneous/add', element: <AddMiscellaneous /> },
            { path: 'miscellaneous', element: <ShowMiscellaneous /> },

            { path: 'miscellaneous-package/add', element: <AddMiscellaneousPackage /> },
            { path: 'miscellaneous-package', element: <ShowMiscellaneousPackages /> },

            { path: 'programs/add', element: <AddProgram /> },
            { path: 'programs', element: <ShowPrograms /> },

            { path: 'typography', element: <Typography /> },
            { path: 'color', element: <Color /> },
            { path: 'icons/Feather', element: <FeatherIcon /> },
            { path: 'icons/font-awesome-5', element: <FontAwesome /> },
            { path: 'icons/material', element: <MaterialIcon /> },
            { path: 'sample-page', element: <Sample /> }
          ]
        }
      ]
    },

    // Catch-all
    {
      path: '*',
      element: <ErrorPage />
    }
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
