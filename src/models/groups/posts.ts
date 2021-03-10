import firebase from 'firebase';
import firebaseType from 'firebase';
import { GroupData } from './groups';

export type PostData = {
  id?: string;
  name: string;
  timestamp: firebase.firestore.Timestamp;
  dueTimestamp: firebase.firestore.Timestamp | null;
  /**
   * Markdown string of the post content
   */
  body: string;
  isPinned: boolean;
  isPublished: boolean;
  /**
   * Map of problem ID to ProblemData
   */
  problems: { [key: string]: ProblemData };
};

export type ProblemData = {
  id: string;
  postId: string;
  name: string;
  body: string;
  source: string;
  points: number;
  difficulty: string;
  hints: ProblemHint[];
  solution:
    | {
        type: 'URL';
        url: string;
      }
    | {
        type: 'MARKDOWN';
        body: string;
      };
  submissionType: SubmissionType;
};

export type ProblemHint = {
  /**
   * How many points you lose for activating the hint
   */
  penalty: number;
  /**
   * Publicly visible hint name, optional
   */
  name?: string;
  /**
   * Hint content, markdown format
   */
  body: string;
};

export enum SubmissionType {
  SELF_GRADED = 'Self Graded',
  COMPCS_API = 'CompCS API',
}

export type Submission = {
  id: string;
  type: SubmissionType;
  problemId: string;
  userId: string;
  code: string;
  language: 'cpp' | 'java' | 'py';
  timestamp: firebase.firestore.Timestamp;
  /**
   * If type is SELF_GRADED, this is a numerical number 0-100
   * Otherwise, it's an array of test case results
   *
   * (Is there a better way to type this?)
   */
  result: number | TestCaseResult[];
};

export enum ExecutionStatus {
  AC = 'AC',
  WA = 'WA',
  TLE = 'TLE',
  MLE = 'MLE',
  RTE = 'RTE',
  PENDING = 'Pending',
}

export type TestCaseResult = {
  status: ExecutionStatus;
  /**
   * Execution time in milliseconds
   */
  executionTime: number;
};

export const postConverter = {
  toFirestore(post: PostData): firebaseType.firestore.DocumentData {
    return {
      name: post.name,
      timestamp: post.timestamp,
      dueTimestamp: post.dueTimestamp,
      body: post.body,
      isPinned: post.isPinned,
      isPublished: post.isPublished,
      problems: post.problems,
    };
  },

  fromFirestore(
    snapshot: firebaseType.firestore.QueryDocumentSnapshot,
    options: firebaseType.firestore.SnapshotOptions
  ): PostData {
    return {
      ...snapshot.data(options),
      id: snapshot.id,
    } as PostData;
  },
};

export const submissionConverter = {
  toFirestore(submission: Submission): firebaseType.firestore.DocumentData {
    const { id, ...data } = submission;
    return data;
  },

  fromFirestore(
    snapshot: firebaseType.firestore.QueryDocumentSnapshot,
    options: firebaseType.firestore.SnapshotOptions
  ): Submission {
    return {
      ...snapshot.data(options),
      id: snapshot.id,
    } as Submission;
  },
};

export const isPostAnnouncement = (post: PostData) =>
  Object.keys(post.problems).length === 0;
export const isPostAssignment = (post: PostData) =>
  Object.keys(post.problems).length !== 0;
/**
 * Returns the due date as a string if the post is an assignment with a due date
 * Otherwise returns the posting time as a human-readable string
 */
export const getPostTimestampString = (post: PostData) => {
  if (isPostAssignment(post) && post.dueTimestamp) {
    return 'Due on ' + getPostDueDateString(post);
  } else {
    return 'Posted on ' + getPostDateString(post);
  }
};
export const getPostDateString = (post: PostData) =>
  post.timestamp.toDate().toString().substr(0, 15);
export const getPostDueDateString = (post: PostData) =>
  post.dueTimestamp?.toDate().toString().substr(0, 15);
export const getPostTotalPoints = (post: PostData) =>
  Object.keys(post.problems).reduce(
    (acc, cur) => acc + post.problems[cur].points,
    0
  );
export const getSubmissionTimestampString = (submission: Submission) =>
  submission?.timestamp.toDate().toString().substr(0, 15);
export const getSubmissionStatus = (submission: Submission) => {
  // todo actually implement
  return ExecutionStatus.AC;
};
export const getSubmissionEarnedPoints = (
  submission: Submission,
  problem: ProblemData
) => {
  // todo actually implement
  return problem.points;
};
