// Menu configuration for default layout
const menuItems = {
  items: [
    {
      id: 'accounts',
      title: 'Accounts',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'Accounts',
          title: 'Employee Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          children: [
            {
              id: 'register',
              title: 'Employee Registration',
              type: 'item',
              url: '/register',
              target: true
            },
            {
              id: 'all-users',
              title: 'Employees',
              type: 'item',
              url: '/all-users'
            }
          ]
        },
        
      ]
    },
    {
      id: 'students',
      title: 'Students & Classes',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'Students',
          title: 'Student & Class Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          children: [
            {
              id: 'show-students',
              title: 'Show Students',
              type: 'item',
              url: '/students'
            },
            {
              id: 'show-classes',
              title: 'Show Classes',
              type: 'item',
              url: '/classes'
            },
            {
              id: 'show-attendance',
              title: 'Show Attendance',
              type: 'item',
              url: '/attendance/class'
            }
          ]
        }
        
      ]
    },
    {
      id: 'enrollments',
      title: 'Enrollments',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'Enrollments',
          title: 'Enrollment Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'how_to_reg',
          children: [
            {
              id: 'enroll-student',
              title: 'Enroll',
              type: 'item',
              url: '/students/add'
            },
            {
              id: 'show-enrollments',
              title: 'Show Enrollments',
              type: 'item',
              url: '/enrollments'
            }
          ]
        }
        
      ]
    },
    {
      id: 'academic-year',
      title: 'Enrollment Setup',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'Academic-year',
          title: 'Academic Year',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'add-academic-year',
              title: 'Add Academic Year',
              type: 'item',
              url: '/academic-year/add'
            },
            {
              id: 'list-academic-year',
              title: 'Show Academic Years',
              type: 'item',
              url: '/academic-year'
            }
          ]
        },
        {
          id: 'Miscellaneous-year',
          title: 'Miscellaneous Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'list-misc',
              title: 'Miscellaneous',
              type: 'item',
              url: '/miscellaneous'
            },
            {
              id: 'list-misc-package',
              title: 'Miscellaneous Packages',
              type: 'item',
              url: '/miscellaneous-package'
            }
          ]
        },
        {
          id: 'Programs-year',
          title: 'Program Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'show-programs',
              title: 'Programs',
              type: 'item',
              url: '/programs/'
            }
          ]
        }
      ]
    },
    // Branches
    {
      id: 'branches',
      title: 'Set Branch',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'add-branch',
          title: 'Branch Modules',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'add_circle',
          children: [
            {
              id: 'add-branch',
              title: 'Add Branch',
              type: 'item',
              url: '/branch/add'
            },
            {
              id: 'show-branches',
              title: 'Show Branches',
              type: 'item',
              url: '/branches'
            }
          ]
        }
        
      ]
    }
  ]
};

export default menuItems;
