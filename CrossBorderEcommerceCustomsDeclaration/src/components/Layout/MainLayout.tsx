import { useEffect, useState } from 'react';
import { Layout, Menu, ConfigProvider, Breadcrumb, Button } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  DollarOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useLayoutStore } from '@/stores/layoutStore';
import type { MenuProps } from 'antd';

const { Sider, Content, Header } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  {
    key: 'hs-codes-group',
    icon: <SearchOutlined />,
    label: 'HS编码管理',
    children: [
      { key: '/hs-codes', icon: <SearchOutlined />, label: 'HS编码查询' },
      { key: '/hs-codes/mapping', icon: <ApartmentOutlined />, label: '类目映射' },
    ],
  },
  { key: '/declarations', icon: <FileTextOutlined />, label: '申报管理' },
  { key: '/tariff', icon: <DollarOutlined />, label: '关税缴纳' },
  { key: '/archive', icon: <FolderOutlined />, label: '报关单存档' },
];

const breadcrumbNameMap: Record<string, string> = {
  '/orders': '订单管理',
  '/hs-codes': 'HS编码管理',
  '/hs-codes/mapping': '类目映射',
  '/declarations': '申报管理',
  '/declarations/new': '新建申报',
  '/tariff': '关税缴纳',
  '/archive': '报关单存档',
};

function getSelectedKeys(pathname: string): string[] {
  if (pathname.startsWith('/declarations/')) return ['/declarations'];
  return [pathname];
}

function getRequiredOpenKeys(pathname: string): string[] {
  if (pathname.startsWith('/hs-codes')) return ['hs-codes-group'];
  return [];
}

function buildBreadcrumbItems(pathname: string) {
  const items: { title: string }[] = [{ title: '首页' }];

  if (pathname === '/') return items;

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (const segment of segments) {
    currentPath += '/' + segment;
    const name = breadcrumbNameMap[currentPath];
    if (name) {
      items.push({ title: name });
    } else if (currentPath.match(/^\/declarations\/[^/]+$/) && segment !== 'new') {
      items.push({ title: '申报详情' });
    } else {
      items.push({ title: segment });
    }
  }

  return items;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed, toggleCollapsed } = useLayoutStore();
  const [openKeys, setOpenKeys] = useState<string[]>(
    () => getRequiredOpenKeys(location.pathname),
  );

  useEffect(() => {
    const required = getRequiredOpenKeys(location.pathname);
    setOpenKeys((prev) => [...new Set([...prev, ...required])]);
  }, [location.pathname]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0F2B46',
          borderRadius: 6,
        },
        components: {
          Layout: {
            siderBg: '#0F2B46',
            headerBg: '#ffffff',
          },
          Menu: {
            darkItemBg: '#0F2B46',
            darkSubMenuItemBg: '#0a1f33',
            darkItemSelectedBg: '#D4A843',
            darkItemHoverBg: '#1a3d5c',
            darkItemSelectedColor: '#0F2B46',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          theme="dark"
          trigger={null}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
          }}
        >
          <div className="sidebar-logo">
            <ContainerOutlined style={{ fontSize: 24, color: '#D4A843' }} />
            {!collapsed && <span className="sidebar-logo-text">关务申报</span>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys(location.pathname)}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Header className="main-header">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className="trigger-btn"
            />
            <Breadcrumb items={buildBreadcrumbItems(location.pathname)} />
          </Header>
          <Content style={{ padding: 24, background: '#F5F7FA', minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
