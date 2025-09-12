export interface LintExecutorSchema {
  projectRoot?: string;
  fix?: boolean;
  format?:
    | 'checkstyle'
    | 'default'
    | 'github'
    | 'gitlab'
    | 'json'
    | 'junit'
    | 'stylish'
    | 'unix';
  quiet?: boolean;
  maxWarnings?: number;
}
