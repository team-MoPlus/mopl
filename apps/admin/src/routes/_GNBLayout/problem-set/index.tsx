import { $api, deleteProblemSet, getSearchProblemSet, postProblemSet } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  Modal,
  ProblemPreview,
  SearchInput,
  SectionCard,
  TwoButtonModalTemplate,
} from '@components';
import { useModal } from '@hooks';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { getSearchProblemSetParamsType } from '@types';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem-set/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState<getSearchProblemSetParamsType>({});
  const { register, handleSubmit, reset } = useForm<getSearchProblemSetParamsType>();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemSetId = useRef<number | null>(null);

  const { data: problemSetList } = getSearchProblemSet(searchQuery);
  const { mutate: mutatePostProblemSet } = postProblemSet();
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();

  const handleClickSearch = (data: getSearchProblemSetParamsType) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );

    setSearchQuery({ ...filteredData });
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery({});
  };

  const handleClickDelete = (problemSetId: number) => {
    deleteProblemSetId.current = problemSetId;
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemSetId.current) return;

    mutateDeleteProblemSet(
      {
        params: {
          path: {
            problemSetId: deleteProblemSetId.current,
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/problemSet/search').queryKey,
          });
          closeDeleteModal();
        },
      }
    );
  };

  const handleClickRegister = () => {
    mutatePostProblemSet(
      {},
      {
        onSuccess: (data) => {
          navigate({
            to: '/problem-set/$problemSetId',
            params: {
              problemSetId: data.data.id.toString(),
            },
          });
        },
      }
    );
  };

  return (
    <>
      <Header title='세트 목록' />
      <form
        className='mt-[4.8rem] flex items-end justify-between'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-[2.4rem]'>
          <SearchInput
            sizeType='long'
            label='세트 타이틀'
            placeholder='입력해주세요.'
            {...register('problemSetTitle', { required: false })}
          />
          <SearchInput
            sizeType='long'
            label='문항 타이틀'
            placeholder='입력해주세요.'
            {...register('problemTitle', { required: false })}
          />
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      <div className='mt-[6.4rem] flex flex-col gap-[4.8rem]'>
        {problemSetList?.data.map((problemSet) => (
          <SectionCard>
            <div className='flex items-center justify-between'>
              <h2 className='font-bold-24 text-black'>{problemSet.problemSetTitle}</h2>
              <div className='flex gap-[1.6rem]'>
                <IconButton variant='delete' onClick={() => handleClickDelete(problemSet.id)} />
                <Link
                  to={'/problem-set/$problemSetId'}
                  params={{
                    problemSetId: problemSet.id?.toString(),
                  }}>
                  <IconButton variant='right' />
                </Link>
              </div>
            </div>
            <div className='mt-[3.2rem] flex gap-[2.4rem] overflow-auto'>
              {problemSet.problemThumbnailResponses.map((problem) => (
                <ProblemPreview
                  title={problem.problemTitle ?? ''}
                  memo={problem.problemMemo ?? ''}
                  imgSrc={problem.mainProblemImageUrl ?? ''}
                />
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
      <FloatingButton onClick={handleClickRegister}>새로운 세트 등록하기</FloatingButton>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='세트를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
