import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

const TabView = ({ tabs }:any) => {
  return (
    <Tabs>
      <TabList style={{ width: '300px', gap: '60px' }}>
        {tabs.map((tab:any, index:any) => (
          <Tab key={index} style={{fontWeight:'bold'}}>{tab.label}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {tabs.map((tab:any, index:any) => (
          <TabPanel key={index}>
            <Box p={4}>{tab.content}</Box>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

export default TabView;
