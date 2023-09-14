export {};
import {
  Box,
  Center,
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Code,
  Spinner,
  List,
  ListItem,
} from '@chakra-ui/react';
import Breadcrumbs from 'components/breadcrumb';
import { Error } from 'components/error';
import { FormListItem } from 'components/form-list-item';
import { FormWrapper } from 'components/form-wrapper';
import AppLayout from 'layout/app-layout';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FunctionComponent, useState } from 'react';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import { routes } from 'routes';
import useSWR from 'swr';
import { compose } from 'lib/compose';
import {
  AccessOperationEnum,
  AccessServiceEnum,
  requireNextAuth,
  useAuthorizationApi,
  withAuthorization,
} from '@roq/nextjs';
import { FiCheck, FiCopy, FiEdit2 } from 'react-icons/fi';
import { getBotById } from 'apiSdk/bots';
import { BotInterface } from 'interfaces/bot';
import SearchPage from 'components/search-page';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import TabView from 'components/tab-view';

function BotViewPage() {
  const { hasAccess } = useAuthorizationApi();
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<BotInterface>(
    () => (id ? `/bots/${id}` : null),
    () =>
      getBotById(id, {
        relations: ['organization'],
      }),
  );
  const baseUrl = window.location.origin;
  const [isCopyingToken, setIsCopyingToken] = useState(false); // State for API Token copy icon
  const [isCopyingEndpoint, setIsCopyingEndpoint] = useState(false); // State for API Endpoint copy icon

  const copyText = (type: string) => {
    const textToCopy = type === 'token' ? data.id : `${baseUrl}/api/ai-search`;
    navigator.clipboard.writeText(textToCopy);

    if (type === 'token') {
      setIsCopyingToken(true);
      setTimeout(() => {
        setIsCopyingToken(false);
      }, 3000);
    } else {
      setIsCopyingEndpoint(true);
      setTimeout(() => {
        setIsCopyingEndpoint(false);
      }, 3000);
    }
  };

  const codeSnippet = `fetch("<your-API-endpoint>", {
    method: "POST",
    headers: {
      token: "<Your token>"
    },
    body: JSON.stringify({
      query: "<Your Query>"
    })
});`;

  const RestAPI = () => {
    return (
      <Box>
        <Box pt={3}>
          <Text fontSize="2xl" fontWeight="bold" p="2">
            API Token
          </Text>
          <InputGroup>
            <Input value={data.id} p="2" />
            <InputRightElement>
              {isCopyingToken ? (
                <IconButton aria-label="Check" icon={<FiCheck />} size="sm" />
              ) : (
                <IconButton aria-label="Copy" icon={<FiCopy />} onClick={() => copyText('token')} size="sm" />
              )}
            </InputRightElement>
          </InputGroup>
        </Box>

        <Box pt={3} mt="4" border="1px" borderColor="gray.600" borderStyle="dashed" minH={120} p="4" borderRadius="md">
          <Text fontSize="2xl" fontWeight="bold" p="2">
            API Endpoint
          </Text>
          <InputGroup>
            <Input value={`${baseUrl}/api/ai-search`} p="2" />
            <InputRightElement>
              {isCopyingEndpoint ? (
                <IconButton aria-label="Check" icon={<FiCheck />} size="sm" />
              ) : (
                <IconButton aria-label="Copy" icon={<FiCopy />} onClick={() => copyText('endpoint')} size="sm" />
              )}
            </InputRightElement>
          </InputGroup>

          <Box pt={3}>
            <Text>You can use the code as follows:</Text>
            <Box >
              <SyntaxHighlighter language="javascript" style={atomOneDark}>
                {codeSnippet}
              </SyntaxHighlighter>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const tabs = [
    { label: 'Sources', content: <SearchPage apiKey={data?.id} /> },
    { label: 'Get REST API', content: <RestAPI /> },
  ];

  return (
    <AppLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              label: 'Bots',
              link: '/bots',
            },
            {
              label: 'Bot Details',
              isCurrent: true,
            },
          ]}
        />
      }
    >
      <Box rounded="md">
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {isLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <>
            <FormWrapper wrapperProps={{ border: 'none', gap: 3, p: 0 }}>
              <Flex alignItems="center" w="full" justifyContent="space-between">
                <Box>
                  <Text fontSize="1.875rem" fontWeight={700} color="base.content">
                    Bot Details
                  </Text>
                </Box>
                {hasAccess('bot', AccessOperationEnum.UPDATE, AccessServiceEnum.PROJECT) && (
                  <NextLink href={`/bots/edit/${id}`} passHref legacyBehavior>
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      mr={2}
                      padding="0rem 0.5rem"
                      height="24px"
                      fontSize="0.75rem"
                      variant="outline"
                      color="state.info.main"
                      borderRadius="6px"
                      border="1px"
                      borderColor="state.info.transparent"
                      leftIcon={<FiEdit2 width="12px" height="12px" color="state.info.main" />}
                    >
                      Edit
                    </Button>
                  </NextLink>
                )}
              </Flex>

              <List
                w="100%"
                css={{
                  '> li:not(:last-child)': {
                    borderBottom: '1px solid var(--chakra-colors-base-300)',
                  },
                }}
              >
                <FormListItem label="Name" text={data?.name} />
                <FormListItem label="Description" text={data?.description} />
              </List>
            </FormWrapper>
          </>
        )}
        <Box pt={8}>
        <TabView tabs={tabs} />
        </Box>
      </Box>
    </AppLayout>
  );
}

export default compose(
  requireNextAuth({
    redirectTo: '/',
  }),
  withAuthorization({
    service: AccessServiceEnum.PROJECT,
    entity: 'bot',
    operation: AccessOperationEnum.READ,
  }),
)(BotViewPage);
