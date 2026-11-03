Pod::Spec.new do |s|
  s.name           = 'IhwaHaptic'
  s.version        = '1.0.0'
  s.summary        = '진동 생성기 보관·재사용 모듈(공용)'
  s.description    = '진동 생성기를 종류마다 하나씩 보관해 다시 쓰고, 울린 직후 prepare()로 탭틱 엔진을 깨워 두어 연타에도 바로 울리게 한다'
  s.author         = ''
  s.homepage       = 'https://github.com/jongin-2/ihwa'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = "**/*.{h,m,mm,swift}"
end
