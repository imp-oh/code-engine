/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-04-06 11:32:40
 * @LastEditTime: 2021-07-06 11:30:07
 * @Description: ...每位新修改者自己的信息
 */

//生成唯一订单号  雪花算法
export const bigInOrderNo = (key = 1) => {
  var Snowflake = /** @class */ (function() {
    function Snowflake(_workerId, _dataCenterId, _sequence) {
      const fn1 = BigInt(-1);
      const n5 = BigInt(5);
      this.twepoch = BigInt(1288834974657);
      this.workerIdBits = n5;
      this.dataCenterIdBits = n5;
      this.maxWrokerId = fn1 ^ (fn1 << this.workerIdBits); // 值为：31
      this.maxDataCenterId = fn1 ^ (fn1 << this.dataCenterIdBits); // 值为：31
      this.sequenceBits = BigInt(12);
      this.workerIdShift = this.sequenceBits; // 值为：12
      this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：17
      this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：22
      this.sequenceMask = fn1 ^ (fn1 << this.sequenceBits); // 值为：4095
      this.lastTimestamp = fn1;
      //设置默认值,从环境变量取
      this.workerId = BigInt(1);
      this.dataCenterId = BigInt(1);
      this.sequence = BigInt(0);
      if (this.workerId > this.maxWrokerId || this.workerId < 0) {
        throw new Error('_workerId must max than 0 and small than maxWrokerId-[' + this.maxWrokerId + ']');
      }
      if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
        throw new Error('_dataCenterId must max than 0 and small than maxDataCenterId-[' + this.maxDataCenterId + ']');
      }

      this.workerId = BigInt(_workerId);
      this.dataCenterId = BigInt(_dataCenterId);
      this.sequence = BigInt(_sequence);
    }
    Snowflake.prototype.tilNextMillis = function(lastTimestamp) {
      var timestamp = this.timeGen();
      while (timestamp <= lastTimestamp) {
        timestamp = this.timeGen();
      }
      return BigInt(timestamp);
    };
    Snowflake.prototype.timeGen = function() {
      return BigInt(Date.now());
    };
    Snowflake.prototype.nextId = function() {
      var timestamp = this.timeGen();
      if (timestamp < this.lastTimestamp) {
        throw new Error('Clock moved backwards. Refusing to generate id for ' +
          (this.lastTimestamp - timestamp));
      }
      if (this.lastTimestamp === timestamp) {
        this.sequence = (this.sequence + BigInt(1)) & this.sequenceMask;
        if (this.sequence === BigInt(0)) {
          timestamp = this.tilNextMillis(this.lastTimestamp);
        }
      } else {
        this.sequence = BigInt(0);
      }
      this.lastTimestamp = timestamp;
      return ((timestamp - this.twepoch) << this.timestampLeftShift) |
        (this.dataCenterId << this.dataCenterIdShift) |
        (this.workerId << this.workerIdShift) |
        this.sequence;
    };
    return Snowflake;
  }());
  var tempSnowflake = new Snowflake(BigInt(1), BigInt(1), BigInt(0));
  var orderNo = tempSnowflake.nextId();


  return String(orderNo).replace('1', key)
}


// 菜单递归
export const getMenu = (arr = []) => {
  const arrays = []
  const tree = (all = [], row) => {
    if (row.children.lenght !== 0) {
      for (var index in row.children) {
        const item = row.children[index]
        const arrays = all.filter(aitem => aitem.parent_id === item.id)
        item.children = arrays
        item.show = false
        item.isSave = false // false 着不需要保存 || ture需要保存
        tree(all, item)
      }
    }
    return row
  }

  arr.forEach(item => {
    if (item.level === 0) {
      const all = arr.filter(aitem => aitem.parent_id === item.id)
      const children = all.filter(aitem => (aitem.level - 1) === item.level)
      item.children = children
      arrays.push(tree(arr, item))
    }
  })
  return arrays
}



// 防节流
export const debounce = (fn, gapTime) => {
  if (gapTime == null || gapTime == undefined) { gapTime = 1500 }
  let _lastTime = null
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}


// export default {
//   bigInOrderNo, getMenu, debounce
// }