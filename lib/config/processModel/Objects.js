
let cloneDeep = require('../../../node_modules/clone-deep');



class Objects {

  constructor() {}//I don't think this is necessary; double check
  
  copyArray(array) {
      return array.concat([]);
  }

  copyObject(object) {//technically, you can copy an array with this, since Arrays are objects, but you lose the built-in array functions
      return cloneDeep(object);
  }

  copyObjectsInArray(array) {
    let newArray = []
    for(let element in array) {
      newArray.push(this.copyObject(array[element]));
    }
    return newArray;
  }

  isNullOrEmpty(object) {
    return object == null && object == undefined;//should this be ||
  }

  isNotNullOrEmpty(object) {
    return object != null && object != undefined;
    // return !this.isNullOrEmpty(object);
  }

  isNull(object) {//public static boolean isNull(Object object) {
    return object == null;
  }

  isNotNull(object) {// public static boolean isNotNull(Object object) {
    return object != null;
  }

  equals(a, b) {//public static boolean equals(Object a, Object b) {
    return (a == b) || (this.isNotNull(a) && Object.is(a, b));// I don't think this works
  }

  hash(values) {// public static int hash(Object... values) {//WHY IS THERE '...'???
    return Arrays.hashCode(values);
  }

  remove(array, element) {//remove first instance found
    let index = array.indexOf(element);
    if(index > -1) {
        return array.splice(index, 1);//this returns the removed item
    }
  }

  removeAll(array, element) {//removeAllInstancesFromArray
    return array.filter(e => e !== element);
  }

  //implement .freeze()?
  unmodifiableList(list) {//public static <T> List<T> unmodifiableList(List<? extends T> list) {
    return Collections.unmodifiableList(new ArrayList(list));
  }

  unmodifiableSet(set) {//  public static <T> Set<T> unmodifiableSet(Set<? extends T> set) {
    return Collections.unmodifiableSet(new HashSet(set));
  }

  unmodifiableMap(map) {//public static <K, V> Map<K, V> unmodifiableMap(Map<? extends K, ? extends V> map) {
    return Collections.unmodifiableMap(new HashMap(map));
  }
}

module.exports = Objects;