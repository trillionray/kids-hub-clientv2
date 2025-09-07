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
          id: 'register',
          title: 'Employee Registration',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'person_add_alt_1',
          url: '/register',
          target: true
        },
        {
          id: 'all-users',
          title: 'Show All Users',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/all-users'
        }
      ]
    },
    {
      id: 'students',
      title: 'Students',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'show-students',
          title: 'Show Students',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/students'
        }
      ]
    },
    {
      id: 'classes',
      title: 'Classes',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'show-classes',
          title: 'Show Classes',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/classes'
        }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'show-attendance',
          title: 'Show Attendance',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/attendance/class'
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
          id: 'enroll-student',
          title: 'Enroll',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'how_to_reg',
          url: '/students/add'
        },
        {
          id: 'show-enrollments',
          title: 'Show Enrollments',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/enrollments'
        }
      ]
    },
    {
      id: 'academic-year',
      title: 'Academic Year',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'add-academic-year',
          title: 'Add Academic Year',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'add_circle',
          url: '/academic-year/add'
        },
        {
          id: 'list-academic-year',
          title: 'Show Academic Years',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/academic-year'
        }
      ]
    },
    {
      id: 'miscellaneous',
      title: 'Miscellaneous',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'list-misc',
          title: 'Miscellaneous',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/miscellaneous'
        },
        {
          id: 'list-misc-package',
          title: 'Miscellaneous Packages',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/miscellaneous-package'
        }
      ]
    },
    {
      id: 'programs',
      title: 'Programs',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'show-programs',
          title: 'Programs',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/programs/'
        }
      ]
    },
    // Branches
    {
      id: 'branches',
      title: 'Branches',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'add-branch',
          title: 'Add Branch',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'add_circle',
          url: '/branch/add'
        },
        {
          id: 'show-branches',
          title: 'Show Branches',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'list_alt',
          url: '/branches'
        }
      ]
    }
  ]
};

export default menuItems;
