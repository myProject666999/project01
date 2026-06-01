import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, ConfigProvider, theme } from 'antd'
import {
  CoffeeOutlined,
  FireOutlined,
  LineChartOutlined,
  FundOutlined,
  UploadOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import GreenBeans from './pages/GreenBeans'
import RoastingRecords from './pages/RoastingRecords'
import RoastingDetail from './pages/RoastingDetail'
import CuppingScores from './pages/CuppingScores'
import CurveCompare from './pages/CurveCompare'
import ArtisanImport from './pages/ArtisanImport'

const { Sider, Content, Header } = Layout

const menuItems = [
  { key: '/green-beans', icon: <CoffeeOutlined />, label: '生豆管理' },
  { key: '/roasting-records', icon: <FireOutlined />, label: '烘焙记录' },
  { key: '/cupping-scores', icon: <TrophyOutlined />, label: '杯测评分' },
  { key: '/curve-compare', icon: <FundOutlined />, label: '曲线对比' },
  { key: '/artisan-import', icon: <UploadOutlined />, label: 'Artisan导入' },
]

const coffeeTheme = {
  token: {
    colorPrimary: '#6F4E37',
    colorInfo: '#6F4E37',
    colorSuccess: '#8B6914',
    colorWarning: '#D4A574',
    colorError: '#A0522D',
    borderRadius: 8,
    colorBgContainer: '#FFFAF5',
    colorBgLayout: '#FAF6F1',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
}

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0]

  return (
    <ConfigProvider theme={coffeeTheme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            background: 'linear-gradient(180deg, #3E2723 0%, #5D4037 100%)',
          }}
          theme="dark"
        >
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <FireOutlined style={{ fontSize: 28, color: '#D4A574' }} />
            {!collapsed && (
              <span style={{
                color: '#D4A574',
                fontSize: 16,
                fontWeight: 600,
                marginLeft: 10,
                whiteSpace: 'nowrap',
              }}>
                烘焙曲线
              </span>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderRight: 0,
            }}
          />
        </Sider>
        <Layout>
          <Header style={{
            background: '#FFFAF5',
            padding: '0 24px',
            borderBottom: '1px solid #E8DDD3',
            display: 'flex',
            alignItems: 'center',
          }}>
            <h1 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#3E2723',
              margin: 0,
            }}>
              <LineChartOutlined style={{ marginRight: 8, color: '#6F4E37' }} />
              咖啡豆烘焙曲线管理系统
            </h1>
          </Header>
          <Content style={{
            margin: 16,
            padding: 24,
            background: '#FFFAF5',
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}>
            <Routes>
              <Route path="/green-beans" element={<GreenBeans />} />
              <Route path="/roasting-records" element={<RoastingRecords />} />
              <Route path="/roasting-records/:id" element={<RoastingDetail />} />
              <Route path="/cupping-scores" element={<CuppingScores />} />
              <Route path="/curve-compare" element={<CurveCompare />} />
              <Route path="/artisan-import" element={<ArtisanImport />} />
              <Route path="*" element={<GreenBeans />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
