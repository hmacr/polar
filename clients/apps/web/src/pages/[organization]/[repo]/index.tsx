import EmptyLayout from '@/components/Layout/EmptyLayout'
import IssuesLookingForFunding from '@/components/Organization/IssuesLookingForFunding'
import RepoSelection from '@/components/Organization/RepoSelection'
import PageNotFound from '@/components/Shared/PageNotFound'
import type { GetServerSideProps, NextLayoutComponentType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { api } from 'polarkit'
import {
  IssuePublicRead,
  OrganizationPublicRead,
  Platforms,
  RepositoryPublicRead,
} from 'polarkit/api/client'
import { ReactElement } from 'react'

const Page: NextLayoutComponentType = ({
  organization,
  repositories,
  issues,
}: {
  organization?: OrganizationPublicRead
  repositories?: RepositoryPublicRead[]
  issues?: IssuePublicRead[]
}) => {
  const router = useRouter()

  if (!organization) {
    return <PageNotFound />
  }
  if (!repositories) {
    return <PageNotFound />
  }

  const repoName = router.query.repo
  const repo = repositories.find((r) => r.name === repoName)

  if (!repo) {
    return <PageNotFound />
  }

  return (
    <>
      <Head>
        <title>
          Polar | {organization.name}/{repo.name}
        </title>
      </Head>

      <div className="mx-auto mt-12 flex w-full flex-col space-y-12 px-2 md:max-w-[970px] md:px-0">
        <div className="flex items-center space-x-4 text-black">
          <img src={organization.avatar_url} className="h-8 w-8 rounded-full" />
          <div className="text-lg font-medium">{organization.name}</div>
          <div>/</div>
          <RepoSelection
            organization={organization}
            repositories={repositories}
            value={repo}
            onSelectRepo={(org, repo) => {
              router.push(`/${org}/${repo}`)
            }}
          />
        </div>

        <h1 className="text-center text-3xl font-normal text-gray-800 dark:text-gray-300 md:text-3xl">
          {organization.name}/{repo.name} have{' '}
          {issues && issues?.length > 0 ? issues?.length : 'no'} issues looking
          for funding
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-500">{repo.description}</p>

          <div className="flex items-center space-x-4 text-gray-600">
            {repo.license && <p>{repo.license}</p>}
            <p>{repo.stars} stars</p>
            {repo.homepage && (
              <a className="text-blue-600" href={repo.homepage}>
                {repo.homepage}
              </a>
            )}
          </div>
        </div>

        {issues && (
          <IssuesLookingForFunding
            organization={organization}
            repositories={repositories}
            issues={issues}
          />
        )}
      </div>
    </>
  )
}

Page.getLayout = (page: ReactElement) => {
  return <EmptyLayout>{page}</EmptyLayout>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    if (
      typeof context?.params?.organization !== 'string' ||
      typeof context?.params?.repo !== 'string'
    ) {
      return { props: {} }
    }

    const res = await api.organizations.getPublicIssues({
      platform: Platforms.GITHUB,
      orgName: context.params.organization,
      repoName: context.params.repo,
    })
    const { organization, repositories, issues } = res
    return { props: { organization, repositories, issues } }
  } catch (Error) {
    return { props: {} }
  }
}

export default Page
