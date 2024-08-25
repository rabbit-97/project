import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { outmanual } from './server.js';

function manual() {
  console.log(chalk.blue('메인 메뉴에서 1번을 눌러 게임을 시작합니다.'));
  console.log(chalk.blue('게임은 기본적으로 각 플레이어와 몬스터가 속도를 가지고 시작합니다.'));
  console.log(
    chalk.blue(
      '공격을 주고 받는게 아닌 속도로 공격 확률을 가져가며 확률에 의해 연속으로 행동이 가능합니다.',
    ),
  );
  console.log(
    chalk.blue(
      '전투 중 몬스터 처치 시 플레이어는 일정 확률로 장비를 획득 가능하고 전투 중 2번을 통해 장착 할 수 있습니다.',
    ),
  );
  console.log(chalk.blue('10스테이지를 클리어 또는 플레이어의 체력이 0일 시 게임은 종료됩니다.'));
  console.log(chalk.blue(' *** 메인 메뉴로 돌아가려면 1을 입력하세요. ***'));
  const returnChoice = readlineSync.question('입력: ');

  if (returnChoice === '1') {
    outmanual;
  } else {
    console.log(chalk.red('잘못된 입력입니다.'));
  }
}

function displayinmanual() {
  console.clear();

  console.log(
    chalk.cyan(
      figlet.textSync('RL- Javascript', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.magentaBright('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

  // 설명 텍스트
  console.log(chalk.green('옵션을 선택해주세요.'));
  console.log();

  // 옵션들
  console.log(chalk.blue('1.') + chalk.white(' 메뉴얼 확인하기 '));
  console.log(chalk.blue('2.') + chalk.white(' 메인 화면으로 돌아가기 '));
  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('원하는 행동을 입력한 뒤 엔터를 누르세요.'));
}
function handleUserInput1() {
  const choice = readlineSync.question('입력: ');

  switch (choice) {
    case '1':
      console.log(chalk.green('** 기본적인 게임 메뉴얼 **'));
      manual();
    case '2':
      console.log(chalk.yellow('메인 화면으로 돌아가기'));
      outmanual();
      break;

    default:
      console.log(chalk.red('올바른 선택을 하세요.'));
      handleUserInput1(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

export async function inmanual() {
  displayinmanual();
  handleUserInput1();
}
