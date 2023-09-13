import {
  Box,
  Center,
  Flex,
  Link,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
  Image,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
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
import { UserPageTable } from 'components/user-page-table';
import { EntityImage } from 'components/entity-image';
import { FiCheck, FiCopy, FiEdit2 } from 'react-icons/fi';

import { getBotById } from 'apiSdk/bots';
import { BotInterface } from 'interfaces/bot';
import SearchPage from 'components/search-page';

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
  const [showCheckIcon, setShowCheckIcon] = useState(false);

  const copyText = () => {
    const textToCopy = data.id;
    navigator.clipboard.writeText(textToCopy);
    setShowCheckIcon(true);

    setTimeout(() => {
      setShowCheckIcon(false);
    }, 3000);
  };
  const [deleteError, setDeleteError] = useState(null);
  const [createError, setCreateError] = useState(null);

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
              <Flex alignItems="center" w="full" justifyContent={'space-between'}>
                <Box>
                  <Text
                    sx={{
                      fontSize: '1.875rem',
                      fontWeight: 700,
                      color: 'base.content',
                    }}
                  >
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
                <Box pt="3">
                  <Text fontSize="2xl" fontWeight="bold" p="2">
                    API Key
                  </Text>
                  <InputGroup>
                    <Input value={data.id} p="2" />
                    <InputRightElement>
                      {showCheckIcon ? (
                        <IconButton aria-label="Check" icon={<FiCheck />} size="sm" />
                      ) : (
                        <IconButton aria-label="Copy" icon={<FiCopy />} onClick={copyText} size="sm" />
                      )}
                    </InputRightElement>
                  </InputGroup>
                </Box>
              </List>
            </FormWrapper>

            <SearchPage apiKey={data.id} />
          </>
        )}
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
