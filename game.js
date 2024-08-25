import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { gamemain } from './server.js';

class Skill {
  constructor(name, probability, effect) {
    this.name = name;
    this.probability = probability;
    this.effect = effect;
  }
}

const combo = new Skill('연속 공격', 0.3, (player, monster, logs) => {
  for (let i = 0; i < 3; i++) {
    player.attack(monster, logs);
  }
  logs.push(chalk.green(`연속 공격을 성공!`));
});

class Player {
  constructor(player) {
    this.name = '';
    this.hp = 100;
    this.attacks = 15;
    this.defense = 5;
    this.speed = 12;
    this.inventory = [];
  }

  equip(item) {
    console.log('아이템 선택 후 엔터 두번');
    console.log('현재 장비 목록 :');
    if (this.equippedItem) {
      console.log(`[장착] ${this.equippedItem.name}`);
    }
    this.inventory.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.name} (공격력 +${item.attackBonus}, 방어력 +${item.defenseBonus})`,
      );
    });
    console.log('0. 장착 취소');

    const equipChoice = readlineSync.question('장비를 선택하세요 : ');
    let selectedItem;

    if (equipChoice === '0') {
      if (this.equippedItem) {
        this.unequip();
        console.log('장착 해제!');
      } else {
        console.log('장착된 장비가 없습니다.');
      }
    } else if (equipChoice > 0 && equipChoice <= this.inventory.length) {
      const selectedItem = this.inventory[equipChoice - 1];
      this.equip(selectedItem);
      console.log(`${selectedItem.name} 장착!`);
    } else {
      console.log('잘못된 입력입니다.');
    }

    if (equipChoice > 0 && equipChoice <= this.inventory.length) {
      const selectedItem = this.inventory[equipChoice - 1];
      if (selectedItem instanceof Equipment) {
        this.equippedItem = selectedItem;
        this.attacks += selectedItem.attackBonus || 0;
        this.defense += selectedItem.defenseBonus || 0;
        console.log(`${selectedItem.name} 장착!`);
        console.log(`현재 공격력: ${this.attacks}, 방어력: ${this.defense}`);
      } else {
        console.log('장착 실패: 장착할 수 없는 아이템입니다.');
      }
    } else {
      console.log('잘못된 입력입니다.');
    }
  }

  unequip() {
    if (this.equippedItem) {
      this.attacks -= this.equippedItem.attackBonus;
      this.defense -= this.equippedItem.defenseBonus;
      this.equippedItem = null;
      console.log('장착 해제!');
    } else {
      console.log('장착된 장비가 없습니다.');
    }
  }

  attack(monster, logs) {
    const critical = 0.1;
    const Cri = Math.random() < critical;
    const inidamage = this.attacks - monster.defense;
    const random = Math.random() * 20 - 1;
    const damage = Math.max(1, Math.round(inidamage + random));
    const finalDamage = Cri ? damage * 2 : damage;
    monster.hp -= finalDamage > 0 ? finalDamage : 1;

    logs.push(chalk.green(`${this.name}이 ${finalDamage}${Cri ? ' (크리티컬!)' : ''} 공격!`));

    if (Math.random() < combo.probability) {
      combo.effect(this, monster, logs);
      return;
    }
  }
}

function increaseStats(player) {
  const increase = 30;
  player.attacks += Math.floor(Math.random() * increase) + 10;
  player.defense += Math.floor(Math.random() * increase);

  console.log(
    chalk.green(`공격력: ${player.attacks}, 방어력: ${player.defense}, 스피드: ${player.speed}`),
  );
}

class Equipment {
  constructor(name, attackBonus, defenseBonus) {
    this.name = name;
    this.attackBonus = attackBonus;
    this.defenseBonus = defenseBonus;
  }
}

class Monster {
  constructor(stage) {
    this.hp = stage * 100;
    this.attacks = stage * 20;
    this.defense = stage * 6;
    this.speed = stage * 1;
    this.name = `몬스터${stage}`;
  }

  attack(player) {
    const inidamage = this.attacks - player.defense;
    const random = Math.random() * 20 - 10;
    const damage = Math.max(1, Math.round(inidamage + random));
    player.hp -= damage;
    console.log(chalk.redBright(`*** ${this.name}가 ${damage} 공격! ***`));
    return damage;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===\n`));
  console.log(
    chalk.cyanBright(`\n | Stage: ${stage} \n`) +
      chalk.blueBright(
        `\n | 플레이어 정보 | 체력 ${player.hp} | 공격력 ${player.attacks} | 방어력 ${player.defense} | 스피드 ${player.speed} | \n | 장착 장비: ${player.equippedItem ? player.equippedItem.name : '없음'} |\n`,
      ) +
      chalk.redBright(
        `\n | 몬스터 정보 | 체력 ${monster.hp} | 공격력 ${monster.attacks} | 방어력 ${monster.defense} | 스피드 ${monster.speed} | \n`,
      ),
  );
  console.log(chalk.magentaBright(`\n=====================\n`));
}

function Turn(player, monster) {
  const speedy = player.speed - monster.speed;
  if (speedy < 0) {
    speedy = 0;
  }
  const probability = 0.5 + speedy * 0.01;
  return Math.random() < probability ? 'player' : 'monster';
}

const battle = async (stage, player, monster) => {
  let logs = [];
  let turns = Turn(player, monster);

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    turns = Turn(player, monster);

    if (turns === 'player') {
      console.log(chalk.green(`\n플레이어의 턴입니다.`));
      console.log(chalk.green(`\n1. 공격한다 2. 장비 장착 - 몬스터가 때림. 3. 메인메뉴로 이동`));
      const choice = readlineSync.question(chalk.bgGray('선택 > '));

      logs.push(chalk.green(`****  ${choice}를 선택  ****`));

      switch (choice) {
        case '1':
          player.attack(monster, logs);
          if (monster.hp <= 0) {
            console.log(chalk.cyanBright(`${monster.name} 처치!! 다음 스테이지!`));
            player.hp += 50;
            console.log(chalk.green(` 체력이 50 증가 !! 현재 체력 : ${player.hp} `));
            logs.push(chalk.green(`${player.name}가 ${player.attacks} 공격!`));
            increaseStats(player, stage);
            const dropRate = 0.3;
            if (Math.random() < dropRate) {
              const newEquipment = new Equipment('검', 10, 5);
              player.inventory.push(newEquipment);
              logs.push(chalk.green('검을 주웠다!'));
            }
          }
          break;
        case '2':
          player.equip();
          break;
        case '3':
          console.log(chalk.green('메인 메뉴로 이동합니다.'));
          console.log(chalk.cyanBright('!! 미리 입력하면 안돼용 5초 대기 !!'));
          console.log(chalk.cyanBright('다음 화면에서 미리 입력한 만큼 입력합니다'));
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await gamemain();
          break;
        default: {
          console.log('잘못된 선택');
          break;
        }
      }
    }

    if (monster.hp > 0) {
      const damage = monster.attack(player);
      logs.push(chalk.red(`${monster.name} ${damage} 공격!`));
      logs.push(chalk.red(` 몬스터 공격 후 플레이어 체력 : ${player.hp}`));
    }
  }
};

export async function startGame() {
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    stage++;

    if (player.hp > 0) {
      console.log(chalk.blue('*** 승리!!!! ***'));
      console.log(chalk.blue(`*** 5초 후 스테이지 ${stage}로 이동합니다. ***`));
      console.log(chalk.cyanBright('!! 미리 입력하면 안돼용 5초 대기 !!'));
      console.log(chalk.cyanBright('다음 화면에서 미리 입력한 만큼 입력합니다'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      console.log(chalk.redBright('으악'));
      console.log(chalk.blue('*** 캐릭터가 죽어 메인메뉴로 이동합니다. ***'));
      console.log(chalk.cyanBright('!! 미리 입력하면 안돼용 5초 대기 !!'));
      console.log(chalk.cyanBright('다음 화면에서 미리 입력한 만큼 입력합니다'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await gamemain();
      break;
    }
  }
}
